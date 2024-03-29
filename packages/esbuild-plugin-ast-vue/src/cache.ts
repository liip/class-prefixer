import { SFCDescriptor } from '@vue/compiler-sfc';
import hash from 'hash-sum';

const descriptorCache: Record<string, SFCDescriptor> = {};

export function setDescriptorCache(
  filename: string,
  descriptor: SFCDescriptor,
) {
  descriptorCache[filename] = descriptor;
}

export function getDescriptorCache(filename: string) {
  const cache = descriptorCache[filename];
  if (!cache) {
    throw new Error('no descriptor cache');
  }
  return cache;
}

const idCache: Record<string, string> = {};

export function setId(filename: string) {
  return (idCache[filename] = `data-v-${hash(filename)}`);
}

export function getId(filename: string) {
  const id = idCache[filename];

  if (!id) {
    throw new Error('no scope id');
  }

  return id;
}
