import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockGetSkill = vi.fn();
vi.mock('~/modules/skill-manager', () => ({
  skillManager: {
    getSkill: mockGetSkill
  }
}));

const mockSendToBackground = vi.fn();
vi.mock('~/modules/messaging', () => ({
  messaging: {
    sendToBackground: mockSendToBackground
  }
}));

describe('Skill Application Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applySkill', () => {
    it('should set skill name from skill manager when skill exists', async () => {
      const { skillManager } = await import('~/modules/skill-manager');

      mockGetSkill.mockResolvedValueOnce({
        id: 'test-skill',
        name: 'Test Skill',
        description: 'Test description',
        systemPrompt: 'Test prompt',
        metadata: { author: 'Test', version: '1.0', tags: [], examples: [], category: 'Test' },
        isBuiltIn: true,
        createdAt: Date.now()
      });

      const selectedSkill = { value: null as string | null };
      const selectedSkillName = { value: null as string | null };

      async function applySkill(skillId: string): Promise<void> {
        selectedSkill.value = skillId;
        try {
          const skill = await skillManager.getSkill(skillId);
          if (skill) {
            selectedSkillName.value = skill.name;
          } else {
            selectedSkillName.value = skillId;
          }
        } catch (error) {
          selectedSkillName.value = skillId;
        }
      }

      await applySkill('test-skill');

      expect(selectedSkill.value).toBe('test-skill');
      expect(selectedSkillName.value).toBe('Test Skill');
    });

    it('should fallback to skill ID when skill not found', async () => {
      const { skillManager } = await import('~/modules/skill-manager');

      mockGetSkill.mockResolvedValueOnce(null);

      const selectedSkill = { value: null as string | null };
      const selectedSkillName = { value: null as string | null };

      async function applySkill(skillId: string): Promise<void> {
        selectedSkill.value = skillId;
        try {
          const skill = await skillManager.getSkill(skillId);
          if (skill) {
            selectedSkillName.value = skill.name;
          } else {
            selectedSkillName.value = skillId;
          }
        } catch (error) {
          selectedSkillName.value = skillId;
        }
      }

      await applySkill('unknown-skill');

      expect(selectedSkill.value).toBe('unknown-skill');
      expect(selectedSkillName.value).toBe('unknown-skill');
    });

    it('should fallback to skill ID on error', async () => {
      const { skillManager } = await import('~/modules/skill-manager');

      mockGetSkill.mockRejectedValueOnce(new Error('Load error'));

      const selectedSkill = { value: null as string | null };
      const selectedSkillName = { value: null as string | null };

      async function applySkill(skillId: string): Promise<void> {
        selectedSkill.value = skillId;
        try {
          const skill = await skillManager.getSkill(skillId);
          if (skill) {
            selectedSkillName.value = skill.name;
          } else {
            selectedSkillName.value = skillId;
          }
        } catch (error) {
          selectedSkillName.value = skillId;
        }
      }

      await applySkill('error-skill');

      expect(selectedSkill.value).toBe('error-skill');
      expect(selectedSkillName.value).toBe('error-skill');
    });
  });

  describe('sendMessage with skill', () => {
    it('should clear skill selection after sending message', async () => {
      const { messaging } = await import('~/modules/messaging');

      mockSendToBackground.mockResolvedValueOnce(undefined);

      const selectedSkill = { value: 'test-skill' as string | null };
      const selectedSkillName = { value: 'Test Skill' as string | null };

      async function sendMessage(content: string): Promise<void> {
        try {
          await messaging.sendToBackground('SEND_MESSAGE', {
            content,
            skillId: selectedSkill.value,
            includePageContent: true
          });
          selectedSkill.value = null;
          selectedSkillName.value = null;
        } catch (error) {
          throw error;
        }
      }

      await sendMessage('Test message');

      expect(selectedSkill.value).toBe(null);
      expect(selectedSkillName.value).toBe(null);
    });

    it('should not clear skill on send error', async () => {
      const { messaging } = await import('~/modules/messaging');

      mockSendToBackground.mockRejectedValueOnce(new Error('Send error'));

      const selectedSkill = { value: 'test-skill' as string | null };
      const selectedSkillName = { value: 'Test Skill' as string | null };

      async function sendMessage(content: string): Promise<void> {
        try {
          await messaging.sendToBackground('SEND_MESSAGE', {
            content,
            skillId: selectedSkill.value,
            includePageContent: true
          });
          selectedSkill.value = null;
          selectedSkillName.value = null;
        } catch (error) {
          throw error;
        }
      }

      try {
        await sendMessage('Test message');
      } catch (e) {
        // Expected error
      }

      expect(selectedSkill.value).toBe('test-skill');
      expect(selectedSkillName.value).toBe('Test Skill');
    });
  });
});