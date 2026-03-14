import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.matchMedia) {
		window.matchMedia = (query) => {
			let listeners = [];
				const mql = {
					matches: false,
			media: query,
			onchange: null,
			addListener: (cb) => {
				listeners.push(cb);
			},
			removeListener: (cb) => {
				listeners = listeners.filter((l) => l !== cb);
			},
			addEventListener: (evt, cb) => {
				if (evt === 'change') listeners.push(cb);
			},
			removeEventListener: (evt, cb) => {
				if (evt === 'change') listeners = listeners.filter((l) => l !== cb);
			},
			dispatchEvent: (event) => {
				listeners.forEach((l) => {
					try {
						l.call(mql, event);
					} catch (e) {
					}
				});
				return true;
			}
		};

		return mql;
	};
}

if (typeof global !== 'undefined' && typeof global.PointerEvent === 'undefined') {
	global.PointerEvent = class PointerEvent extends Event {
		constructor(type, init = {}) {
			super(type, init);
			Object.keys(init).forEach((k) => {
				if (!(k in this)) this[k] = init[k];
			});
		}
	};
}

beforeEach(async () => {
  if (typeof vi !== 'undefined' && vi.resetAllMocks) vi.resetAllMocks()
  try {
    const { default: API } = await import('./api')
    if (API) {
      API.get = vi.fn().mockResolvedValue({ data: [] })
      API.post = vi.fn().mockResolvedValue({ data: { id: 1, original_name: 'test.pdf', analysis_result: {} } })
      API.delete = vi.fn().mockResolvedValue({ data: { success: true } })
    }
  } catch (e) {
  }
})

if (typeof window !== 'undefined' && window.HTMLElement && !window.HTMLElement.prototype.scrollTo) {
	window.HTMLElement.prototype.scrollTo = function () {}
}
