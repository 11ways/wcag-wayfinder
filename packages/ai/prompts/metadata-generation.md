# WCAG Success Criterion Metadata Generation

You are an expert accessibility consultant specializing in WCAG (Web Content Accessibility Guidelines). Your task is to analyze WCAG success criteria and assign comprehensive metadata including potentially affected user groups, responsible professionals, relevant technologies, and descriptive tags.

## Your Task

Analyze the provided WCAG success criterion and return a JSON object with metadata assignments. Each assignment should include:
- **Relevance score**: 0.0 to 1.0 (how strongly this metadata applies)
- **Reasoning**: Brief explanation for the assignment

## Available Metadata

### Affected Users
{{AFFECTED_USERS_LIST}}

### Assignees (Professional Roles)
{{ASSIGNEES_LIST}}

### Technologies
{{TECHNOLOGIES_LIST}}

### Tags (by Category)
{{TAGS_LIST}}

## Output Format

Return ONLY valid JSON in this exact structure:

```json
{
  "affected_users": [
    {
      "id": 1,
      "relevance_score": 0.95,
      "reasoning": "Brief explanation"
    }
  ],
  "assignees": [
    {
      "id": 1,
      "relevance_score": 0.90,
      "reasoning": "Brief explanation"
    }
  ],
  "technologies": [
    {
      "id": 1,
      "relevance_score": 0.85,
      "reasoning": "Brief explanation"
    }
  ],
  "tags": [
    {
      "id": 1,
      "relevance_score": 0.95,
      "reasoning": "Brief explanation"
    }
  ]
}
```

## Scoring Guidelines

- **0.9-1.0**: Directly and primarily affected/responsible/relevant
- **0.7-0.89**: Significantly affected/responsible/relevant
- **0.5-0.69**: Moderately affected/responsible/relevant
- **0.3-0.49**: Somewhat affected/responsible/relevant
- **Below 0.3**: Minimally relevant (consider excluding)

## Guidelines

1. **Be comprehensive but selective**: Include all truly relevant metadata, but avoid marginal connections
2. **Consider the full impact**: Think about the largest groups of people who might be affected, who can (typically or likely) fix it, what tech is needed, and what concepts apply
3. **Provide clear reasoning**: Each assignment should have a brief but clear explanation
4. **Prioritize primary impacts**: Higher scores for direct/primary relationships
5. **Include 1-5 items for Affected users, Assignees and Technologies, and max. 10 for the tags** Aim for thorough but focused metadata

## ⚠️ CRITICAL: ID Selection Rules

**YOU MUST VERIFY EACH ID BEFORE USING IT:**

1. **Read the metadata lists carefully**: Each item shows "ID X: Name - Description"
2. **Match your reasoning to the actual name**: If your reasoning mentions "HTML", use the ID for "HTML" (not any other ID)
3. **Double-check before submitting**: Review each assignment to ensure the ID number corresponds to the name in your reasoning
4. **Common mistake to avoid**: Do NOT use an ID if the name doesn't match what you're describing in the reasoning

**Example of CORRECT usage:**
- Reasoning: "HTML alt attribute is primary" → Use ID 51 (HTML)
- Reasoning: "ARIA labels provide alternatives" → Use ID 54 (ARIA)

**Example of INCORRECT usage (DO NOT DO THIS):**
- Reasoning: "HTML implementation" → Using ID 47 (which is Multimedia, not HTML) ❌
- Reasoning: "ARIA attributes" → Using ID 50 (which is Audio control, not ARIA) ❌

---

# Few-Shot Examples

## Example 1: Success Criterion 1.1.1 - Non-text Content

**Input:**
```
ID: 1.1.1
Number: 1.1.1
Title: Non-text Content
Level: A
Principle: Perceivable
Guideline: 1.1 Text Alternatives

Description: All non-text content that is presented to the user has a text alternative that serves the equivalent purpose, except for the situations listed below.

Content: Provide text alternatives for any non-text content so that it can be changed into other forms people need, such as large print, braille, speech, symbols or simpler language.
```

**Output:**
```json
{
  "affected_users": [
    {
      "id": 4,
      "relevance_score": 1.0,
      "reasoning": "Blind users cannot perceive images and completely rely on alternative text"
    },
    {
      "id": 3,
      "relevance_score": 0.85,
      "reasoning": "Users with vision disabilities may need text alternatives for magnification or high contrast"
    },
    {
      "id": 7,
      "relevance_score": 0.75,
      "reasoning": "Users with cognitive disabilities benefit from simpler text alternatives"
    },
    {
      "id": 13,
      "relevance_score": 0.90,
      "reasoning": "All assistive technology users rely on text alternatives for non-text content"
    }
  ],
  "assignees": [
    {
      "id": 1,
      "relevance_score": 1.0,
      "reasoning": "Content creators write and maintain alternative text for images and media"
    },
    {
      "id": 2,
      "relevance_score": 0.70,
      "reasoning": "Designers determine which images are decorative vs. meaningful"
    },
    {
      "id": 3,
      "relevance_score": 0.85,
      "reasoning": "Developers implement alt attributes and ARIA labels in code"
    },
    {
      "id": 4,
      "relevance_score": 0.80,
      "reasoning": "QA testers verify all images have appropriate alternative text"
    }
  ],
  "technologies": [
    {
      "id": 1,
      "relevance_score": 1.0,
      "reasoning": "HTML alt attribute is the primary mechanism for text alternatives"
    },
    {
      "id": 4,
      "relevance_score": 0.85,
      "reasoning": "ARIA labels and descriptions provide alternatives for complex elements"
    },
    {
      "id": 5,
      "relevance_score": 0.95,
      "reasoning": "Screen readers announce the alternative text to users"
    },
    {
      "id": 21,
      "relevance_score": 0.75,
      "reasoning": "SVG accessibility requires proper title and desc elements"
    }
  ],
  "tags": [
    {
      "id": 1,
      "relevance_score": 1.0,
      "reasoning": "This criterion is fundamentally about alternative text for images"
    },
    {
      "id": 51,
      "relevance_score": 0.90,
      "reasoning": "HTML implementation of alt attributes is primary solution"
    },
    {
      "id": 54,
      "relevance_score": 0.85,
      "reasoning": "ARIA attributes supplement HTML for complex scenarios"
    },
    {
      "id": 19,
      "relevance_score": 0.80,
      "reasoning": "Icons require alternative text to be understood"
    }
  ]
}
```

## Example 2: Success Criterion 2.1.1 - Keyboard

**Input:**
```
ID: 2.1.1
Number: 2.1.1
Title: Keyboard
Level: A
Principle: Operable
Guideline: 2.1 Keyboard Accessible

Description: All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes, except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints.

Content: Make all functionality available from a keyboard.
```

**Output:**
```json
{
  "affected_users": [
    {
      "id": 9,
      "relevance_score": 1.0,
      "reasoning": "Users with motor disabilities often cannot use a mouse and rely entirely on keyboard"
    },
    {
      "id": 4,
      "relevance_score": 0.95,
      "reasoning": "Blind users navigate entirely via keyboard when using screen readers"
    },
    {
      "id": 10,
      "relevance_score": 0.90,
      "reasoning": "Users with physical disabilities may use keyboard emulation devices"
    },
    {
      "id": 13,
      "relevance_score": 0.85,
      "reasoning": "Many assistive technologies simulate keyboard input"
    }
  ],
  "assignees": [
    {
      "id": 3,
      "relevance_score": 1.0,
      "reasoning": "Developers implement keyboard event handlers and focus management"
    },
    {
      "id": 2,
      "relevance_score": 0.80,
      "reasoning": "Designers create interaction patterns that work with keyboard navigation"
    },
    {
      "id": 4,
      "relevance_score": 0.85,
      "reasoning": "QA testers verify all functionality works without a mouse"
    },
    {
      "id": 6,
      "relevance_score": 0.60,
      "reasoning": "UX researchers test keyboard navigation patterns with users"
    }
  ],
  "technologies": [
    {
      "id": 3,
      "relevance_score": 0.95,
      "reasoning": "JavaScript handles keyboard events and focus management"
    },
    {
      "id": 1,
      "relevance_score": 0.90,
      "reasoning": "Semantic HTML elements provide built-in keyboard support"
    },
    {
      "id": 4,
      "relevance_score": 0.75,
      "reasoning": "ARIA roles and properties support keyboard interaction patterns"
    },
    {
      "id": 6,
      "relevance_score": 0.80,
      "reasoning": "Alternative input devices simulate keyboard for navigation"
    },
    {
      "id": 16,
      "relevance_score": 1.0,
      "reasoning": "Focus management is central to keyboard accessibility"
    }
  ],
  "tags": [
    {
      "id": 32,
      "relevance_score": 1.0,
      "reasoning": "This criterion is specifically about keyboard accessibility"
    },
    {
      "id": 33,
      "relevance_score": 0.95,
      "reasoning": "Focus management is essential for keyboard navigation"
    },
    {
      "id": 27,
      "relevance_score": 0.85,
      "reasoning": "Focus indicators help keyboard users see where they are"
    },
    {
      "id": 41,
      "relevance_score": 0.75,
      "reasoning": "Navigation patterns must be keyboard accessible"
    },
    {
      "id": 36,
      "relevance_score": 0.70,
      "reasoning": "Touch targets relate to keyboard activation areas"
    }
  ]
}
```

## Example 3: Success Criterion 1.4.3 - Contrast (Minimum)

**Input:**
```
ID: 1.4.3
Number: 1.4.3
Title: Contrast (Minimum)
Level: AA
Principle: Perceivable
Guideline: 1.4 Distinguishable

Description: The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for large text, incidental text, logotypes, or text that is part of an inactive user interface component.

Content: Ensure sufficient contrast between text and background colors.
```

**Output:**
```json
{
  "affected_users": [
    {
      "id": 5,
      "relevance_score": 1.0,
      "reasoning": "Users with low vision directly struggle with insufficient color contrast"
    },
    {
      "id": 6,
      "relevance_score": 0.75,
      "reasoning": "Users with color blindness may have difficulty with certain color combinations"
    },
    {
      "id": 15,
      "relevance_score": 0.80,
      "reasoning": "Older adults often experience reduced contrast sensitivity"
    },
    {
      "id": 17,
      "relevance_score": 0.70,
      "reasoning": "Users in bright sunlight or challenging environments need high contrast"
    }
  ],
  "assignees": [
    {
      "id": 2,
      "relevance_score": 1.0,
      "reasoning": "Designers select color palettes and ensure contrast ratios"
    },
    {
      "id": 3,
      "relevance_score": 0.75,
      "reasoning": "Developers implement CSS with appropriate color values"
    },
    {
      "id": 4,
      "relevance_score": 0.85,
      "reasoning": "QA testers measure and verify contrast ratios"
    },
    {
      "id": 9,
      "relevance_score": 0.60,
      "reasoning": "Brand managers may need to adjust brand colors for compliance"
    }
  ],
  "technologies": [
    {
      "id": 2,
      "relevance_score": 1.0,
      "reasoning": "CSS defines text and background colors"
    },
    {
      "id": 17,
      "relevance_score": 0.90,
      "reasoning": "Color scheme design is fundamental to meeting this criterion"
    },
    {
      "id": 11,
      "relevance_score": 0.70,
      "reasoning": "High contrast mode may be needed as an alternative"
    }
  ],
  "tags": [
    {
      "id": 25,
      "relevance_score": 1.0,
      "reasoning": "This criterion specifically addresses color contrast ratios"
    },
    {
      "id": 26,
      "relevance_score": 0.75,
      "reasoning": "Related to general color usage principles"
    },
    {
      "id": 28,
      "relevance_score": 0.70,
      "reasoning": "Visual design must account for contrast requirements"
    },
    {
      "id": 48,
      "relevance_score": 0.85,
      "reasoning": "CSS implementation of color values is key"
    }
  ]
}
```

---

# Now Analyze This Criterion

{{CRITERION_DATA}}

Return ONLY the JSON object with metadata assignments. Use the IDs from the available metadata lists above.
