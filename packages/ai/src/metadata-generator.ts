import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getDb,
  getAffectedUsers,
  getAssignees,
  getTechnologies,
  getTags,
  type Criterion,
  type AffectedUser,
  type Assignee,
  type Technology,
  type Tag
} from '@wcag-explorer/db/src/client';

const PROMPT_PATH = join(import.meta.dir, '..', 'prompts', 'metadata-generation.md');

export interface MetadataAssignment {
  id: number;
  relevance_score: number;
  reasoning: string;
}

export interface GeneratedMetadata {
  affected_users: MetadataAssignment[];
  assignees: MetadataAssignment[];
  technologies: MetadataAssignment[];
  tags: MetadataAssignment[];
}

type AIProvider = 'anthropic' | 'openai';

export interface MetadataGeneratorOptions {
  provider?: AIProvider;
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class MetadataGenerator {
  private provider: AIProvider;
  private anthropicClient?: Anthropic;
  private openaiConfig?: { apiKey: string; baseURL: string; model: string };
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private promptTemplate: string;

  constructor(options: MetadataGeneratorOptions = {}) {
    // Determine provider (check Thoth/OpenAI first, then Anthropic)
    const thothKey = process.env.THOTH_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (options.provider) {
      this.provider = options.provider;
    } else if (options.baseURL || thothKey) {
      this.provider = 'openai';
    } else if (anthropicKey || openaiKey) {
      this.provider = anthropicKey ? 'anthropic' : 'openai';
    } else {
      throw new Error('No API key found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or THOTH_API_KEY');
    }

    // Configure based on provider
    if (this.provider === 'anthropic') {
      const apiKey = options.apiKey || anthropicKey;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is required for Anthropic provider');
      }
      this.anthropicClient = new Anthropic({ apiKey });
      this.model = options.model || 'claude-3-5-sonnet-20241022';
    } else {
      // OpenAI-compatible API (including Thoth)
      const apiKey = options.apiKey || thothKey || openaiKey;
      const baseURL = options.baseURL || process.env.THOTH_BASE_URL || 'https://thoth.elevenways.be/v1';
      if (!apiKey) {
        throw new Error('API key is required for OpenAI-compatible provider');
      }
      this.openaiConfig = {
        apiKey,
        baseURL,
        model: options.model || 'gpt-4o' // Default model for OpenAI-compatible
      };
      this.model = this.openaiConfig.model;
    }

    this.maxTokens = options.maxTokens || 4096;
    this.temperature = options.temperature || 0.3;

    // Load prompt template
    this.promptTemplate = readFileSync(PROMPT_PATH, 'utf-8');

    console.log(`Initialized MetadataGenerator with provider: ${this.provider}, model: ${this.model}`);
  }

  /**
   * Format reference data for the prompt
   */
  private formatReferenceData(): {
    affectedUsers: string;
    assignees: string;
    technologies: string;
    tags: string;
  } {
    const affectedUsers = getAffectedUsers();
    const assignees = getAssignees();
    const technologies = getTechnologies();
    const tags = getTags();

    // Format affected users
    const affectedUsersList = affectedUsers
      .map((u) => `- ID ${u.id}: ${u.name}${u.description ? ` - ${u.description}` : ''}`)
      .join('\n');

    // Format assignees
    const assigneesList = assignees
      .map((a) => `- ID ${a.id}: ${a.name}${a.description ? ` - ${a.description}` : ''}`)
      .join('\n');

    // Format technologies
    const technologiesList = technologies
      .map((t) => `- ID ${t.id}: ${t.name}${t.description ? ` - ${t.description}` : ''}`)
      .join('\n');

    // Group tags by category
    const tagsByCategory: Record<string, Tag[]> = {};
    for (const tag of tags) {
      const category = tag.category || 'uncategorized';
      if (!tagsByCategory[category]) {
        tagsByCategory[category] = [];
      }
      tagsByCategory[category].push(tag);
    }

    // Format tags
    const tagsList = Object.entries(tagsByCategory)
      .map(([category, categoryTags]) => {
        const formattedTags = categoryTags
          .map((t) => `  - ID ${t.id}: ${t.name}${t.description ? ` - ${t.description}` : ''}`)
          .join('\n');
        return `**${category}:**\n${formattedTags}`;
      })
      .join('\n\n');

    return {
      affectedUsers: affectedUsersList,
      assignees: assigneesList,
      technologies: technologiesList,
      tags: tagsList
    };
  }

  /**
   * Format criterion data for the prompt
   */
  private formatCriterion(criterion: Criterion): string {
    return `
ID: ${criterion.id}
Number: ${criterion.num}
Title: ${criterion.title}
Level: ${criterion.level}
Principle: ${criterion.principle}
Guideline: ${criterion.guideline_id} ${criterion.guideline_title}

Description: ${criterion.description || 'N/A'}

Content: ${criterion.content || 'N/A'}
`.trim();
  }

  /**
   * Build the complete prompt
   */
  private buildPrompt(criterion: Criterion): string {
    const refData = this.formatReferenceData();
    const criterionData = this.formatCriterion(criterion);

    return this.promptTemplate
      .replace('{{AFFECTED_USERS_LIST}}', refData.affectedUsers)
      .replace('{{ASSIGNEES_LIST}}', refData.assignees)
      .replace('{{TECHNOLOGIES_LIST}}', refData.technologies)
      .replace('{{TAGS_LIST}}', refData.tags)
      .replace('{{CRITERION_DATA}}', criterionData);
  }

  /**
   * Parse and validate the AI response
   */
  private parseResponse(response: string): GeneratedMetadata {
    // Extract JSON from response (in case AI includes explanatory text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!data.affected_users || !data.assignees || !data.technologies || !data.tags) {
      throw new Error('Invalid metadata structure');
    }

    // Validate each assignment
    const validateAssignments = (assignments: any[], type: string) => {
      if (!Array.isArray(assignments)) {
        throw new Error(`${type} must be an array`);
      }
      for (const assignment of assignments) {
        if (typeof assignment.id !== 'number') {
          throw new Error(`${type} assignment missing id`);
        }
        if (typeof assignment.relevance_score !== 'number' ||
            assignment.relevance_score < 0 ||
            assignment.relevance_score > 1) {
          throw new Error(`${type} assignment has invalid relevance_score`);
        }
        if (typeof assignment.reasoning !== 'string') {
          throw new Error(`${type} assignment missing reasoning`);
        }
      }
    };

    validateAssignments(data.affected_users, 'affected_users');
    validateAssignments(data.assignees, 'assignees');
    validateAssignments(data.technologies, 'technologies');
    validateAssignments(data.tags, 'tags');

    return data;
  }

  /**
   * Generate metadata for a single criterion
   */
  async generateMetadata(criterion: Criterion): Promise<GeneratedMetadata> {
    const prompt = this.buildPrompt(criterion);

    console.log(`Generating metadata for ${criterion.num} ${criterion.title}...`);

    let responseText: string;

    if (this.provider === 'anthropic' && this.anthropicClient) {
      // Anthropic API
      const message = await this.anthropicClient.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : '';
    } else if (this.provider === 'openai' && this.openaiConfig) {
      // OpenAI-compatible API (including Thoth)
      const response = await fetch(`${this.openaiConfig.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert accessibility consultant. Respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      responseText = data.choices[0]?.message?.content || '';
    } else {
      throw new Error('No AI provider configured');
    }

    if (!responseText) {
      throw new Error('No response from AI');
    }

    return this.parseResponse(responseText);
  }

  /**
   * Validate that reasoning matches the selected IDs
   */
  private validateMetadata(metadata: GeneratedMetadata): void {
    const affectedUsers = getAffectedUsers();
    const assignees = getAssignees();
    const technologies = getTechnologies();
    const tags = getTags();

    // Helper to check if reasoning mentions the item name
    const checkMatch = (
      assignment: MetadataAssignment,
      actualName: string,
      type: string
    ): boolean => {
      const reasoningLower = assignment.reasoning.toLowerCase();
      const nameLower = actualName.toLowerCase();

      // Extract key words from the name (ignore common words)
      const nameWords = nameLower.split(/\s+/).filter(w =>
        w.length > 3 && !['with', 'for', 'and', 'the', 'using', 'users', 'people'].includes(w)
      );

      // Check if at least one key word from the name appears in reasoning
      const hasMatch = nameWords.some(word => reasoningLower.includes(word));

      if (!hasMatch) {
        console.warn(
          `⚠️  Validation Warning (${type}): ` +
          `ID ${assignment.id} is "${actualName}" but reasoning says "${assignment.reasoning}". ` +
          `These don't seem to match!`
        );
      }

      return hasMatch;
    };

    // Validate affected users
    for (const assignment of metadata.affected_users) {
      const user = affectedUsers.find(u => u.id === assignment.id);
      if (!user) {
        throw new Error(`Invalid affected_user ID: ${assignment.id}`);
      }
      checkMatch(assignment, user.name, 'Affected User');
    }

    // Validate assignees
    for (const assignment of metadata.assignees) {
      const assignee = assignees.find(a => a.id === assignment.id);
      if (!assignee) {
        throw new Error(`Invalid assignee ID: ${assignment.id}`);
      }
      checkMatch(assignment, assignee.name, 'Assignee');
    }

    // Validate technologies
    for (const assignment of metadata.technologies) {
      const tech = technologies.find(t => t.id === assignment.id);
      if (!tech) {
        throw new Error(`Invalid technology ID: ${assignment.id}`);
      }
      checkMatch(assignment, tech.name, 'Technology');
    }

    // Validate tags
    for (const assignment of metadata.tags) {
      const tag = tags.find(t => t.id === assignment.id);
      if (!tag) {
        throw new Error(`Invalid tag ID: ${assignment.id}`);
      }
      checkMatch(assignment, tag.name, 'Tag');
    }
  }

  /**
   * Save generated metadata to the database
   */
  saveMetadata(criterionId: string, metadata: GeneratedMetadata): void {
    const db = getDb();

    // Start transaction
    const transaction = db.transaction(() => {
      // Insert affected users
      const affectedUserStmt = db.prepare(`
        INSERT OR REPLACE INTO criteria_affected_users
        (criterion_id, affected_user_id, relevance_score, reasoning, reviewed)
        VALUES (?, ?, ?, ?, 0)
      `);
      for (const item of metadata.affected_users) {
        affectedUserStmt.run(criterionId, item.id, item.relevance_score, item.reasoning);
      }

      // Insert assignees
      const assigneeStmt = db.prepare(`
        INSERT OR REPLACE INTO criteria_assignees
        (criterion_id, assignee_id, relevance_score, reasoning, reviewed)
        VALUES (?, ?, ?, ?, 0)
      `);
      for (const item of metadata.assignees) {
        assigneeStmt.run(criterionId, item.id, item.relevance_score, item.reasoning);
      }

      // Insert technologies
      const technologyStmt = db.prepare(`
        INSERT OR REPLACE INTO criteria_technologies
        (criterion_id, technology_id, relevance_score, reasoning, reviewed)
        VALUES (?, ?, ?, ?, 0)
      `);
      for (const item of metadata.technologies) {
        technologyStmt.run(criterionId, item.id, item.relevance_score, item.reasoning);
      }

      // Insert tags
      const tagStmt = db.prepare(`
        INSERT OR REPLACE INTO criteria_tags
        (criterion_id, tag_id, relevance_score, reasoning, reviewed)
        VALUES (?, ?, ?, ?, 0)
      `);
      for (const item of metadata.tags) {
        tagStmt.run(criterionId, item.id, item.relevance_score, item.reasoning);
      }
    });

    transaction();

    console.log(`✓ Saved metadata for ${criterionId}`);
  }

  /**
   * Generate and save metadata for a single criterion
   */
  async processcriterion(criterion: Criterion): Promise<GeneratedMetadata> {
    const metadata = await this.generateMetadata(criterion);

    // Validate before saving
    console.log('Validating metadata assignments...');
    this.validateMetadata(metadata);
    console.log('✓ Validation complete');

    this.saveMetadata(criterion.id, metadata);
    return metadata;
  }

  /**
   * Generate and save metadata for multiple criteria with rate limiting
   */
  async processBatch(
    criteria: Criterion[],
    options: { delayMs?: number; onProgress?: (current: number, total: number) => void } = {}
  ): Promise<void> {
    const delayMs = options.delayMs || 1000; // Default 1 second between requests
    const failed: { id: string; error: any }[] = [];

    for (let i = 0; i < criteria.length; i++) {
      const criterion = criteria[i];

      try {
        await this.processcriterion(criterion);

        if (options.onProgress) {
          options.onProgress(i + 1, criteria.length);
        }

        // Rate limiting delay (except for last item)
        if (i < criteria.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Error processing ${criterion.id}:`, error);
        failed.push({ id: criterion.id, error });
        // Continue with next criterion instead of stopping
      }
    }

    // Report failures at the end
    if (failed.length > 0) {
      console.log(`\n❌ Failed to process ${failed.length} criteria:`);
      for (const { id, error } of failed) {
        console.log(`  - ${id}: ${error}`);
      }
    }
  }
}
