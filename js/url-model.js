const storage = new Proxy(localStorage, {
    STORAGE_KEY: "url-shortener-mappings",

    get(target, property) {
        if (!["getItem", "setItem"].includes(property)) return Reflect.get(...arguments);
        return target[property].bind(target, this.STORAGE_KEY);
    }
});

const BiMap = new Proxy(Map, {
    construct(target, [entries]) {
        const map = Reflect.construct(...arguments);
        const reverse = new target(entries.map(([key, value]) => [value, key]));

        return Object.defineProperties(map, {
            reverse: {
                get() {
                    return reverse;
                }
            },
            set: {
                value(key, value) {
                    Map.prototype.set.call(map, key, value);
                    reverse.set(value, key);
                    return map;
                }
            }
        });
    }
});

export default class UrlModel {
    #urls = new BiMap(JSON.parse(storage.getItem() ?? "[]"));

    findById(id) {
        return this.#urls.reverse.get(id);
    }

    createShortUrl(url, baseUrl) {
        return Object.assign(new URL(baseUrl), {
            hash: "",
            search: "",
            pathname: this.#urls.get(url) ?? this.#save(url)
        }).href;
    }

    #save(url) {
        let id;
        while (this.#urls.reverse.has((id = this.#generateId())));
        this.#urls.set(url, id);
        storage.setItem(JSON.stringify([...this.#urls.entries()]));
        return id;
    }

    #generateId() {
        return crypto.randomUUID().split("-")[0];
    }
}