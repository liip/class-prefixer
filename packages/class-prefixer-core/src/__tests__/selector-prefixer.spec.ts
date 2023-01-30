import { selectorPrefixer } from '../selector-prefixer';

describe('selector-prefixer', () => {
  const prefix = 'prefix-';
  const excludes = ['excluded', /^is/];

  const options = {
    prefix: {
      value: prefix,
      excludes,
    },
  };

  it('should prefix simple css selector', () => {
    expect(selectorPrefixer('.btn', options)).toBe('.prefix-btn');
  });

  it('should prefix compound class selector', () => {
    expect(selectorPrefixer('.btn.btn--small', options)).toBe(
      '.prefix-btn.prefix-btn--small',
    );
    expect(selectorPrefixer('.btn .btn--small', options)).toBe(
      '.prefix-btn .prefix-btn--small',
    );
    expect(selectorPrefixer('.btn + .btn--small', options)).toBe(
      '.prefix-btn + .prefix-btn--small',
    );
    expect(selectorPrefixer('.btn > .btn--small', options)).toBe(
      '.prefix-btn > .prefix-btn--small',
    );
  });

  it('should prefix multiple css selector', () => {
    expect(selectorPrefixer('.btn, .btn--small', options)).toBe(
      '.prefix-btn, .prefix-btn--small',
    );
    expect(selectorPrefixer('.btn, .btn .btn--small', options)).toBe(
      '.prefix-btn, .prefix-btn .prefix-btn--small',
    );
  });

  it('should prefix nested pseudo-class', () => {
    expect(selectorPrefixer(':is(.btn)', options)).toBe(':is(.prefix-btn)');
    expect(selectorPrefixer('.btn:not(.btn--small)', options)).toBe(
      '.prefix-btn:not(.prefix-btn--small)',
    );
    expect(
      selectorPrefixer('.btn:where(.btn--small, .btn--large)', options),
    ).toBe('.prefix-btn:where(.prefix-btn--small, .prefix-btn--large)');
    expect(
      selectorPrefixer('.btn:where(.btn--small, .btn--large)', options),
    ).toBe('.prefix-btn:where(.prefix-btn--small, .prefix-btn--large)');
  });

  it('should not prefix excluded class', () => {
    expect(selectorPrefixer('.excluded', options)).toBe('.excluded');
    expect(selectorPrefixer('.excluded.btn', options)).toBe(
      '.excluded.prefix-btn',
    );
    expect(selectorPrefixer('.excluded .btn', options)).toBe(
      '.excluded .prefix-btn',
    );
    expect(selectorPrefixer('.excluded + .btn', options)).toBe(
      '.excluded + .prefix-btn',
    );
    expect(selectorPrefixer('.excluded > .btn', options)).toBe(
      '.excluded > .prefix-btn',
    );
    expect(selectorPrefixer('.btn, .excluded.btn', options)).toBe(
      '.prefix-btn, .excluded.prefix-btn',
    );
    expect(
      selectorPrefixer(
        '.btn:is(.excluded), .excluded:where(.btn.is-active, .btn-small.not-is-active)',
        options,
      ),
    ).toBe(
      '.prefix-btn:is(.excluded), .excluded:where(.prefix-btn.is-active, .prefix-btn-small.prefix-not-is-active)',
    );
  });

  it('should not prefix elements', () => {
    expect(selectorPrefixer('button', options)).toBe('button');
    expect(selectorPrefixer('button.btn', options)).toBe('button.prefix-btn');
    expect(selectorPrefixer('button .btn', options)).toBe('button .prefix-btn');
    expect(selectorPrefixer('button + .btn', options)).toBe(
      'button + .prefix-btn',
    );
    expect(selectorPrefixer('button > .btn', options)).toBe(
      'button > .prefix-btn',
    );
  });

  it('should not prefix id selector', () => {
    expect(selectorPrefixer('#btn', options)).toBe('#btn');
    expect(selectorPrefixer('#btn.btn', options)).toBe('#btn.prefix-btn');
    expect(selectorPrefixer('#btn .btn', options)).toBe('#btn .prefix-btn');
    expect(selectorPrefixer('#btn + .btn', options)).toBe('#btn + .prefix-btn');
    expect(selectorPrefixer('#btn > .btn', options)).toBe('#btn > .prefix-btn');
  });

  it('should not prefix pseudo-class', () => {
    expect(selectorPrefixer(':root', options)).toBe(':root');
    expect(selectorPrefixer(':root.btn', options)).toBe(':root.prefix-btn');
    expect(selectorPrefixer(':root .btn', options)).toBe(':root .prefix-btn');
    expect(selectorPrefixer(':root + .btn', options)).toBe(
      ':root + .prefix-btn',
    );
    expect(selectorPrefixer(':root > .btn', options)).toBe(
      ':root > .prefix-btn',
    );
    expect(selectorPrefixer('.btn:hover', options)).toBe('.prefix-btn:hover');
    expect(selectorPrefixer('.btn:hover .btn--small', options)).toBe(
      '.prefix-btn:hover .prefix-btn--small',
    );
  });

  it('should not prefix pseudo-element', () => {
    expect(selectorPrefixer('.btn::before', options)).toBe(
      '.prefix-btn::before',
    );
    expect(selectorPrefixer('.btn::first-line > .btn--small', options)).toBe(
      '.prefix-btn::first-line > .prefix-btn--small',
    );
  });

  it('should not prefix attribute', () => {
    expect(selectorPrefixer('[dir="rtl"] .btn', options)).toBe(
      '[dir="rtl"] .prefix-btn',
    );
  });
});
