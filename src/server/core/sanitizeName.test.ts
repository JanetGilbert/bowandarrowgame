import { describe, expect, it } from 'vitest';
import { MAX_NAME_LENGTH, sanitizeName } from './sanitizeName';

describe('sanitizeName', () => {
  it('leaves ordinary usernames untouched', () => {
    expect(sanitizeName('Janet_G')).toBe('Janet_G');
    expect(sanitizeName('xX_Archer_Xx')).toBe('xX_Archer_Xx');
    expect(sanitizeName('bow-fan-2000')).toBe('bow-fan-2000');
  });

  it('truncates names to the maximum length', () => {
    const long = '8====================================D';
    expect(sanitizeName(long).length).toBeLessThanOrEqual(MAX_NAME_LENGTH);
    expect(sanitizeName('a'.repeat(100))).toBe('a'.repeat(MAX_NAME_LENGTH));
  });

  it('masks swear words and slurs', () => {
    expect(sanitizeName('fuck')).toBe('****');
    expect(sanitizeName('GoFuckYourself')).toBe('Go****Yourself');
    expect(sanitizeName('nigger123')).toBe('******123');
    expect(sanitizeName('BigDick')).toBe('Big****');
    expect(sanitizeName('dick69')).toBe('****69');
    expect(sanitizeName('ass_lord')).toBe('***_lord');
  });

  it('masks leetspeak and spaced-out variants', () => {
    expect(sanitizeName('sh1t_lord')).toBe('****_lord');
    expect(sanitizeName('F u C k')).toBe('*******');
    expect(sanitizeName('fuuuuck')).toBe('*******');
    expect(sanitizeName('b!tch')).toBe('*****');
  });

  it('does not flag innocent words containing banned tokens', () => {
    expect(sanitizeName('Cassidy')).toBe('Cassidy');
    expect(sanitizeName('ClassAct')).toBe('ClassAct');
    expect(sanitizeName('Sussex_Sam')).toBe('Sussex_Sam');
    expect(sanitizeName('raccoon_ranger')).toBe('raccoon_ranger');
    expect(sanitizeName('Cockpit_Casey')).toBe('Cockpit_Casey');
    expect(sanitizeName('Dickens_fan')).toBe('Dickens_fan');
  });

  it('strips control and zero-width characters', () => {
    expect(sanitizeName('Jan\u0000et\u200b')).toBe('Janet');
    expect(sanitizeName('line\nbreak')).toBe('linebreak');
  });

  it('returns an empty string when nothing displayable remains', () => {
    expect(sanitizeName('')).toBe('');
    expect(sanitizeName('   ')).toBe('');
    expect(sanitizeName('\u200b\u200b')).toBe('');
  });
});
