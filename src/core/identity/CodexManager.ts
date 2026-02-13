/**
 * CODEX MANAGER - Seven of Nine Behavioral Rule System
 *
 * Loads and manages codex files containing persona, tactics, ethics, and operational rules
 * Mobile-adapted version using fetch API for asset loading
 */

export interface CodexRule {
  id: string;
  tag: string;
  priority: number;
  content: string;
  checksum: string;
}

export interface CodexFile {
  source: string;
  type: string;
  content: string;
  rules: CodexRule[];
  compiled_at: string;
  checksum: string;
}

export interface CodexCollection {
  persona_core: CodexFile | null;
  persona_tempo: CodexFile | null;
  ethics_creator_bond: CodexFile | null;
  tactics_core: CodexFile | null;
  tactics_leadership: CodexFile | null;
  security_quadra_lock: CodexFile | null;
  humor_style: CodexFile | null;
  ops_triage: CodexFile | null;
  risk_flags: CodexFile | null;
  vices_risk_flags: CodexFile | null;
}

export class CodexManager {
  private codexCollection: Partial<CodexCollection> = {};
  private isLoaded: boolean = false;
  private compiledRules: CodexRule[] = [];

  constructor() {}

  /**
   * Load all codex files from assets
   */
  async loadAllCodex(): Promise<void> {
    if (this.isLoaded) {
      console.log('📚 Codex Manager: Already loaded');
      return;
    }

    console.log('📚 Codex Manager: Loading codex files...');

    const codexFiles = [
      'persona_core',
      'persona_tempo',
      'ethics_creator-bond',
      'tactics_core',
      'tactics_leadership',
      'security_quadra-lock',
      'humor_style',
      'ops_triage',
      'risk_flags',
      'vices_risk_flags'
    ];

    let loadedCount = 0;
    for (const filename of codexFiles) {
      try {
        const codex = await this.loadCodexFile(filename);
        const key = filename.replace(/-/g, '_') as keyof CodexCollection;
        this.codexCollection[key] = codex;
        loadedCount++;
      } catch (error) {
        console.warn(`⚠️  Failed to load codex: ${filename}`, error);
      }
    }

    // Compile all rules sorted by priority
    this.compileRules();

    this.isLoaded = true;
    console.log(`✅ Codex Manager: Loaded ${loadedCount}/${codexFiles.length} codex files`);
  }

  /**
   * Load a single codex file
   */
  private async loadCodexFile(filename: string): Promise<CodexFile> {
    const response = await fetch(`/assets/codex/${filename}.codex.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Compile all rules from loaded codex files, sorted by priority
   */
  private compileRules(): void {
    this.compiledRules = [];

    for (const codex of Object.values(this.codexCollection)) {
      if (codex && codex.rules) {
        this.compiledRules.push(...codex.rules);
      }
    }

    // Sort by priority (higher first)
    this.compiledRules.sort((a, b) => b.priority - a.priority);

    console.log(`📚 Codex Manager: Compiled ${this.compiledRules.length} rules`);
  }

  /**
   * Get all compiled rules
   */
  getAllRules(): CodexRule[] {
    return [...this.compiledRules];
  }

  /**
   * Get rules by tag pattern
   */
  getRulesByTag(tagPattern: string): CodexRule[] {
    const pattern = new RegExp(tagPattern);
    return this.compiledRules.filter(rule => pattern.test(rule.tag));
  }

  /**
   * Get rules by type (persona, tactics, ethics, etc.)
   */
  getRulesByType(type: string): CodexRule[] {
    return this.compiledRules.filter(rule => rule.tag.startsWith(type));
  }

  /**
   * Get specific codex file
   */
  getCodex(name: keyof CodexCollection): CodexFile | null {
    return this.codexCollection[name] || null;
  }

  /**
   * Get compiled system instruction from all codex content
   */
  getSystemInstruction(): string {
    if (!this.isLoaded) {
      return 'Codex not loaded';
    }

    const sections: string[] = [];

    // Persona Core (highest priority)
    if (this.codexCollection.persona_core) {
      sections.push('# PERSONA CORE');
      sections.push(this.codexCollection.persona_core.content);
    }

    // Ethics & Creator Bond
    if (this.codexCollection.ethics_creator_bond) {
      sections.push('\n# ETHICS & CREATOR BOND');
      sections.push(this.codexCollection.ethics_creator_bond.content);
    }

    // Tactics
    if (this.codexCollection.tactics_core) {
      sections.push('\n# TACTICAL CORE');
      sections.push(this.codexCollection.tactics_core.content);
    }

    // Security
    if (this.codexCollection.security_quadra_lock) {
      sections.push('\n# SECURITY PROTOCOLS');
      sections.push(this.codexCollection.security_quadra_lock.content);
    }

    // Operational rules
    if (this.codexCollection.ops_triage) {
      sections.push('\n# OPERATIONAL TRIAGE');
      sections.push(this.codexCollection.ops_triage.content);
    }

    return sections.join('\n\n');
  }

  /**
   * Check if codex is loaded
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Reload all codex files
   */
  async reload(): Promise<void> {
    this.isLoaded = false;
    this.codexCollection = {};
    this.compiledRules = [];
    await this.loadAllCodex();
  }

  /**
   * Get codex statistics
   */
  getStats(): {
    filesLoaded: number;
    totalRules: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};

    for (const rule of this.compiledRules) {
      const type = rule.tag.split('.')[0];
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      filesLoaded: Object.keys(this.codexCollection).length,
      totalRules: this.compiledRules.length,
      byType
    };
  }
}

// Export singleton instance
export default new CodexManager();
