-- ============================================================================
-- Seed Data: Metadata Reference Tables
-- Populates affected_users, assignees, technologies, and tags_reference
-- ============================================================================

-- ============================================================================
-- AFFECTED USERS (User Personas / Disability Types)
-- ============================================================================

INSERT OR IGNORE INTO affected_users (name, description, slug, icon) VALUES
  ('People with hearing disability', 'Users with partial hearing loss who may use captions or transcripts', 'hearing-disability', '👂'),
  ('People who are deaf', 'Users who cannot hear audio content and require visual alternatives', 'deaf', '🔇'),
  ('People with vision disability', 'Users with partial vision loss who may use screen magnification or high contrast', 'vision-disability', '👁️'),
  ('People who are blind', 'Users who cannot see and rely on screen readers or braille displays', 'blind', '🦯'),
  ('People with low vision', 'Users with reduced visual acuity who may use magnification or large text', 'low-vision', '🔍'),
  ('People with color blindness', 'Users who cannot distinguish certain colors and need non-color indicators', 'color-blindness', '🎨'),
  ('People with cognitive disability', 'Users with learning, memory, or attention challenges who need clear language and consistent navigation', 'cognitive-disability', '🧠'),
  ('People with neurological disability', 'Users with conditions like epilepsy who may be sensitive to flashing content', 'neurological-disability', '⚡'),
  ('People with motor disability', 'Users with limited dexterity or mobility who may use alternative input devices', 'motor-disability', '♿'),
  ('People with physical disability', 'Users with physical limitations affecting interaction with devices', 'physical-disability', '🦾'),
  ('People using mobile devices', 'Users on smartphones or tablets who need touch-friendly interfaces', 'mobile-users', '📱'),
  ('People with limited bandwidth', 'Users with slow internet connections who need efficient content loading', 'limited-bandwidth', '📶'),
  ('People using assistive technology', 'Users relying on screen readers, voice control, or other assistive tools', 'assistive-technology', '🔧'),
  ('People with speech disability', 'Users who cannot use voice input and need alternative input methods', 'speech-disability', '🗣️'),
  ('Older adults', 'Users with age-related challenges including vision, hearing, or cognitive changes', 'older-adults', '👴'),
  ('People with temporary disabilities', 'Users with short-term limitations (injuries, environmental factors, etc.)', 'temporary-disabilities', '🩹'),
  ('People in challenging environments', 'Users in bright sunlight, noisy areas, or other difficult conditions', 'challenging-environments', '☀️');

-- ============================================================================
-- ASSIGNEES (Professional Roles)
-- ============================================================================

INSERT OR IGNORE INTO assignees (name, description, slug, icon) VALUES
  ('Content creators', 'Writers, editors, and content strategists responsible for written and multimedia content', 'content-creators', '✍️'),
  ('Designers', 'UX/UI designers responsible for visual design, layout, and user experience', 'designers', '🎨'),
  ('Developers', 'Front-end and back-end developers implementing technical functionality', 'developers', '💻'),
  ('QA testers', 'Quality assurance professionals testing for accessibility compliance', 'qa-testers', '🧪'),
  ('Project managers', 'Project leads ensuring accessibility requirements are met throughout the project', 'project-managers', '📋'),
  ('UX researchers', 'User experience researchers conducting usability testing with diverse users', 'ux-researchers', '🔬'),
  ('Accessibility specialists', 'Dedicated accessibility experts providing guidance and audits', 'accessibility-specialists', '♿'),
  ('Product owners', 'Product leaders defining accessibility requirements and priorities', 'product-owners', '📊'),
  ('Video producers', 'Video and multimedia creators responsible for captions, audio descriptions, etc.', 'video-producers', '🎥'),
  ('Brand managers', 'Brand and marketing teams ensuring accessible communication and materials', 'brand-managers', '🎯');

-- ============================================================================
-- TECHNOLOGIES (Implementation Methods)
-- ============================================================================

INSERT OR IGNORE INTO technologies (name, description, slug, icon) VALUES
  ('HTML', 'Semantic HTML markup and structure', 'html', '📄'),
  ('CSS', 'Styling, layout, and visual presentation', 'css', '🎨'),
  ('JavaScript', 'Client-side interactivity and dynamic behavior', 'javascript', '⚡'),
  ('ARIA', 'Accessible Rich Internet Applications attributes and roles', 'aria', '♿'),
  ('Screen readers', 'Assistive technology for blind and low vision users', 'screen-readers', '🔊'),
  ('Alternative input devices', 'Keyboard, switch control, voice control, and other input methods', 'alternative-input', '⌨️'),
  ('Captions', 'Text alternatives for audio content in videos', 'captions', '📝'),
  ('Transcripts', 'Text versions of audio and video content', 'transcripts', '📋'),
  ('Audio descriptions', 'Narrated descriptions of visual content in videos', 'audio-descriptions', '🎙️'),
  ('Sign language', 'Visual language interpretation for deaf users', 'sign-language', '👋'),
  ('High contrast mode', 'Enhanced visual contrast for low vision users', 'high-contrast', '⚫'),
  ('Screen magnification', 'Zoom and magnification tools for low vision users', 'magnification', '🔍'),
  ('Responsive design', 'Adaptive layouts for different screen sizes and devices', 'responsive-design', '📱'),
  ('Touch interfaces', 'Touch-optimized controls for mobile and tablet users', 'touch-interfaces', '👆'),
  ('Form validation', 'Input validation and error handling', 'form-validation', '✅'),
  ('Focus management', 'Keyboard focus visibility and control', 'focus-management', '🎯'),
  ('Color schemes', 'Color palette design and contrast ratios', 'color-schemes', '🌈'),
  ('Typography', 'Text sizing, spacing, and readability', 'typography', '🔤'),
  ('Animation control', 'Managing motion, transitions, and animations', 'animation-control', '🎬'),
  ('PDF accessibility', 'Accessible PDF document creation', 'pdf-accessibility', '📑'),
  ('SVG accessibility', 'Accessible scalable vector graphics', 'svg-accessibility', '🖼️'),
  ('Video players', 'Accessible media player controls', 'video-players', '▶️'),
  ('Modal dialogs', 'Accessible popup and overlay implementation', 'modal-dialogs', '💬'),
  ('Tables', 'Accessible data table structure', 'tables', '📊'),
  ('Forms', 'Accessible form controls and inputs', 'forms', '📝'),
  ('Navigation', 'Accessible menu and navigation patterns', 'navigation', '🧭'),
  ('Search', 'Accessible search functionality', 'search', '🔍'),
  ('Drag and drop', 'Accessible drag and drop interactions', 'drag-and-drop', '👆'),
  ('Charts and graphs', 'Accessible data visualization', 'charts-graphs', '📈'),
  ('Maps', 'Accessible interactive maps', 'maps', '🗺️');

-- ============================================================================
-- TAGS (Categorization with Categories)
-- ============================================================================

-- Content-related tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Alternative text', 'Image descriptions and alt text', 'alt-text', 'content', '🖼️'),
  ('Captions', 'Synchronized text for video/audio content', 'captions', 'content', '📝'),
  ('Transcripts', 'Full text alternatives for multimedia', 'transcripts', 'content', '📋'),
  ('Audio descriptions', 'Narrated visual information', 'audio-descriptions', 'content', '🎙️'),
  ('Sign language', 'Visual language interpretation', 'sign-language', 'content', '👋'),
  ('Headings', 'Heading structure and hierarchy', 'headings', 'content', '📑'),
  ('Labels', 'Form labels and instructions', 'labels', 'content', '🏷️'),
  ('Link text', 'Descriptive link content', 'link-text', 'content', '🔗'),
  ('Page titles', 'Document and page titles', 'page-titles', 'content', '📄'),
  ('Language', 'Language identification and changes', 'language', 'content', '🌐'),
  ('Reading level', 'Content complexity and readability', 'reading-level', 'content', '📖'),
  ('Error messages', 'Error identification and recovery', 'error-messages', 'content', '⚠️'),
  ('Instructions', 'User guidance and help text', 'instructions', 'content', '📝'),
  ('Abbreviations', 'Acronyms and abbreviation expansion', 'abbreviations', 'content', '📝');

-- Visual/Design tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Color contrast', 'Text and background color ratios', 'color-contrast', 'visual', '🎨'),
  ('Color usage', 'Color as information indicator', 'color-usage', 'visual', '🌈'),
  ('Focus indicators', 'Visible keyboard focus', 'focus-indicators', 'visual', '🎯'),
  ('Visual design', 'Layout, spacing, and presentation', 'visual-design', 'visual', '🎨'),
  ('Icons', 'Icon accessibility and alternatives', 'icons', 'visual', '🔷'),
  ('Images of text', 'Text rendered as images', 'images-of-text', 'visual', '🖼️'),
  ('Text spacing', 'Line height, letter spacing, margins', 'text-spacing', 'visual', '📏'),
  ('Text size', 'Font size and resizing', 'text-size', 'visual', '🔤'),
  ('Reflow', 'Content adaptation to viewport', 'reflow', 'visual', '📱'),
  ('Orientation', 'Portrait and landscape support', 'orientation', 'visual', '🔄'),
  ('Visual presentation', 'Overall visual accessibility', 'visual-presentation', 'visual', '👁️');

-- Interaction tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Keyboard', 'Keyboard navigation and access', 'keyboard', 'interaction', '⌨️'),
  ('Focus management', 'Focus order and visibility', 'focus-management', 'interaction', '🎯'),
  ('Touch targets', 'Touch and pointer target size', 'touch-targets', 'interaction', '👆'),
  ('Input modalities', 'Multiple input methods', 'input-modalities', 'interaction', '🖱️'),
  ('Gestures', 'Touch and pointer gestures', 'gestures', 'interaction', '👋'),
  ('Drag and drop', 'Drag and drop alternatives', 'drag-and-drop', 'interaction', '👆'),
  ('Click targets', 'Clickable area size', 'click-targets', 'interaction', '🎯'),
  ('Hover', 'Hover and focus states', 'hover', 'interaction', '🖱️'),
  ('Timeout', 'Time limits and extensions', 'timeout', 'interaction', '⏱️'),
  ('Motion actuation', 'Device motion alternatives', 'motion-actuation', 'interaction', '📱');

-- Structure/Navigation tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Landmarks', 'ARIA landmarks and regions', 'landmarks', 'structure', '🧭'),
  ('Navigation', 'Navigation menus and patterns', 'navigation', 'structure', '🗺️'),
  ('Skip links', 'Bypass blocks and skip navigation', 'skip-links', 'structure', '⏭️'),
  ('Page structure', 'Document structure and organization', 'page-structure', 'structure', '📋'),
  ('Consistent navigation', 'Predictable navigation patterns', 'consistent-navigation', 'structure', '🧭'),
  ('Breadcrumbs', 'Breadcrumb trails and location', 'breadcrumbs', 'structure', '🍞'),
  ('Tables', 'Table structure and headers', 'tables', 'structure', '📊'),
  ('Lists', 'List structure and semantics', 'lists', 'structure', '📝'),
  ('Forms', 'Form structure and grouping', 'forms', 'structure', '📋');

-- Media tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Video', 'Video accessibility features', 'video', 'media', '🎥'),
  ('Audio', 'Audio accessibility features', 'audio', 'media', '🔊'),
  ('Multimedia', 'Combined audio/video content', 'multimedia', 'media', '🎬'),
  ('Animation', 'Animated content and effects', 'animation', 'media', '🎬'),
  ('Autoplay', 'Automatic media playback', 'autoplay', 'media', '▶️'),
  ('Audio control', 'Audio play/pause/volume controls', 'audio-control', 'media', '🔊');

-- Technical tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('HTML', 'HTML semantics and structure', 'html', 'technical', '📄'),
  ('CSS', 'CSS styling and presentation', 'css', 'technical', '🎨'),
  ('JavaScript', 'JavaScript functionality', 'javascript', 'technical', '⚡'),
  ('ARIA', 'ARIA attributes and roles', 'aria', 'technical', '♿'),
  ('Name, Role, Value', 'Component identification', 'name-role-value', 'technical', '🏷️'),
  ('Status messages', 'Dynamic status announcements', 'status-messages', 'technical', '📢'),
  ('Parsing', 'Valid HTML/markup', 'parsing', 'technical', '🔍'),
  ('Compatibility', 'Assistive technology support', 'compatibility', 'technical', '🔧');

-- Behavior tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Flashing', 'Flashing and seizure prevention', 'flashing', 'behavior', '⚡'),
  ('Motion', 'Animation and motion effects', 'motion', 'behavior', '🎬'),
  ('Predictable', 'Consistent and predictable behavior', 'predictable', 'behavior', '🎯'),
  ('On input', 'Changes on user input', 'on-input', 'behavior', '⌨️'),
  ('On focus', 'Changes on focus', 'on-focus', 'behavior', '🎯'),
  ('Context changes', 'Unexpected context changes', 'context-changes', 'behavior', '🔄'),
  ('Error prevention', 'Preventing and recovering from errors', 'error-prevention', 'behavior', '✅'),
  ('Interruptions', 'Interrupting content and alerts', 'interruptions', 'behavior', '⚠️');

-- Functional tags
INSERT OR IGNORE INTO tags_reference (name, description, slug, category, icon) VALUES
  ('Search', 'Search functionality', 'search', 'functional', '🔍'),
  ('Authentication', 'Login and authentication', 'authentication', 'functional', '🔐'),
  ('Legal and financial', 'Transactions and legal content', 'legal-financial', 'functional', '⚖️'),
  ('Help', 'Help and support features', 'help', 'functional', '❓'),
  ('Error recovery', 'Error correction mechanisms', 'error-recovery', 'functional', '🔄'),
  ('Input assistance', 'Form input help and validation', 'input-assistance', 'functional', '💡');
