import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class EmojiService {
    public _showPickerInChannels = false;
    public _showPickerInThreads = false;
    public _activeCategory = 'smileys';

    emojis: any = {
        "smileys": [
            "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
            "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
            "😋", "😜", "😝", "😛", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
            "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥",
            "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮"
        ],
        "tiere": [
            "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
            "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣",
            "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝",
            "🐛", "🦋", "🐌", "🐚", "🐞", "🐜", "🕷️", "🦂", "🐢", "🐍",
            "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠"
        ],
        "essen": [
            "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
            "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
            "🥬", "🥒", "🌶️", "🌽", "🥕", "🥔", "🍠", "🥐", "🍞", "🥖",
            "🥨", "🥯", "🧀", "🍖", "🍗", "🥩", "🥓", "🍔", "🍟", "🍕",
            "🌭", "🥪", "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲"
        ],
        "aktivität": [
            "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓",
            "🏸", "🥅", "🏒", "🏑", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋",
            "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🏋️‍♂️"
        ],
        "reisen": [
            "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
            "🛻", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨",
            "🚁", "🛩️", "✈️", "🛫", "🛬", "🚀", "🛸", "🚡", "🚠", "🚟",
            "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇"
        ],
        "objekte": [
            "⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️",
            "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥",
            "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️"
        ],
        "symbole": [
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "✅",
            "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "👍",
            "🔔", "🔕", "🎵", "🎶", "⚠️", "🚸", "🔞", "☢️", "☣️", "⬆️",
            "⬇️", "⬅️", "➡️", "↗️", "↘️", "↙️", "↖️", "🔄", "🔁", "🔀"
        ],
    }

    constructor() { }

    toggleChannelPicker() {
        this._showPickerInChannels = !this._showPickerInChannels;
    }

    closePickerInChannels() {
        this._showPickerInChannels = false;
        this._activeCategory = 'smileys';
    }

    toggleThreadsPicker() {
        this._showPickerInThreads = !this._showPickerInThreads;
    }

    closePickerInThreads() {
        this._showPickerInThreads = false;
        this._activeCategory = 'smileys';
    }

    selectCategory(cat: string) {
        this._activeCategory = cat;
    }

    get showPickerInChannels() {
        return this._showPickerInChannels;
    }

    get showPickerInThreads() {
        return this._showPickerInThreads;
    }

    get displayedEmojis(): string[] {
        return this.emojis[this._activeCategory] || this.emojis.smileys;
    }
}