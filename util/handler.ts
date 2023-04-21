type HandlerData<K, Fn> = {
  keys: Array<K>;
  match: string | null;
  handle: Fn;
};

export class Handler<K, Fn> {
  private handlers = new Array<HandlerData<K, Fn>>();

  constructor() {}

  findHandler = (
    key: K,
    match: string | null,
    start = 0,
  ): { handle: Fn; index: number } | null => {
    for (let i = start; i < this.handlers.length; i++) {
      const handler = this.handlers[i];
      if (handler.keys.includes(key) && this.matches(match, handler.match)) {
        return { handle: handler.handle, index: i };
      }
    }
    return null;
  };

  private matches(string: string | null, match: string | null): boolean {
    if (match === null || string === null) return true;
    if (string === match) return true;
    let i = 0;
    while (i < match.length) {
      if (match[i] === "*") return true;
      if (string[i] === undefined) return false;
      if (string[i] === match[i]) i++;
      else return false;
    }
    return string === match;
  }

  add = (keys: Array<K>, match: string | null, handle: Fn) => {
    this.handlers.push({ keys, match, handle });
  };
}
