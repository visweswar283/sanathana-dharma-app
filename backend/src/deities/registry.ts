import { DeityPlugin } from './base/DeityPlugin';
import type { DeityMetadata } from './base/types';
import { HanumaDeity } from './plugins/hanuma';
import { ShivaDeity } from './plugins/shiva';
import { VishnuDeity } from './plugins/vishnu';
import { VinayakaDeity } from './plugins/vinayaka';
import { BrahmaDeity } from './plugins/brahma';

const ALL_DEITIES: DeityPlugin[] = [
  new HanumaDeity(),
  new ShivaDeity(),
  new VishnuDeity(),
  new VinayakaDeity(),
  new BrahmaDeity(),
];

class DeityRegistry {
  private readonly deities = new Map<string, DeityPlugin>();

  constructor(deities: DeityPlugin[]) {
    deities.forEach((d) => this.deities.set(d.metadata.id, d));
  }

  getDeity(id: string): DeityPlugin | undefined {
    return this.deities.get(id);
  }

  /** Only deities with isAvailable === true */
  getAvailableDeities(): DeityMetadata[] {
    return [...this.deities.values()]
      .filter((d) => d.metadata.isAvailable)
      .map((d) => d.metadata);
  }

  /** All deities including upcoming (for deity selection UI teaser) */
  getAllDeities(): DeityMetadata[] {
    return [...this.deities.values()].map((d) => d.metadata);
  }
}

export const deityRegistry = new DeityRegistry(ALL_DEITIES);
