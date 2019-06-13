function getTextNodesIterator(el) {
    const walker = document.createTreeWalker(el, NodeFilter
        .SHOW_TEXT);
    const next = () => {
        const value = walker.nextNode();
        return {
            value,
            done: !value
        };
    };
    walker[Symbol.iterator] = () => ({
        next
    });
    return walker;
}

function korsota(string) {
    const replaces = [
        [/ks(?:i(?=\s|$|\.|,))?/g, 'x'],
        [/ts/g, 'z'],
        [/lt[aä](?=\s|$|\.|,)/gu, 'lt'],
        [/ll[aä](?=\s|$|\.|,)/gu, 'l'],
        [/st[aä](?=\s|$|\.|,)/gu, 'st'],
        [/ss[aä](?=\s|$|\.|,)/gu, 's']
    ];
    // Valikoitu kokoelma välilyöntejä, jotka voi korvata
    const extra_regexp =
        /([\wäö,])([\f\n\r\t\v\u0020\u1680\u3000])(?=[\wäö])/gu;
    const sanat = ["vittu ", "tiätsä ", "niinku ", "totanoin "];
    const final_replaces = [];
    let match;
    while ((match = extra_regexp.exec(string)) !== null) {
        if (Math.random() > 0.75) {
            final_replaces.push([match.index, match[0].length, match[
                1] + match[2] + sanat[
                Math.floor(Math.random() * sanat.length)]]);
        }
    }
    for (const [regexp, replacement] of replaces) {
        while ((match = regexp.exec(string)) !== null) {
            final_replaces.push([match.index, match[0].length,
                replacement
            ]);
        }
    }
    final_replaces.sort(([a, , , ], [b, , , ]) => {
        return a - b;
    });
    let result = '';
    let last_end = 0;
    for (const [start, len, to] of final_replaces) {
        result += string.slice(last_end, start);
        result += to;
        last_end = start + len;
    }
    result += string.slice(last_end, string.length);
    return result;
}

for (const textNode of getTextNodesIterator(document.body)) {
    if (textNode.parentNode.nodeName.toLowerCase() === 'script' ||
        textNode.parentNode.nodeName.toLowerCase() === 'style') {
        continue;
    }
    textNode.textContent = korsota(textNode.textContent);
}

const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            for (const textNode of getTextNodesIterator(node)) {
                if (textNode.parentNode.nodeName.toLowerCase() ===
                    'script' || textNode.parentNode.nodeName
                    .toLowerCase() === 'style') {
                    continue;
                }
                textNode.textContent = korsota(textNode
                    .textContent);
            }
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});
