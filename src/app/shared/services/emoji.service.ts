import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class EmojiService {
    public _showPickerInChannels = false;
    public _showPickerInChannelMessage = false;
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
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
            "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
            "🔔", "🔕", "🎵", "🎶", "⚠️", "🚸", "🔞", "☢️", "☣️", "⬆️",
            "⬇️", "⬅️", "➡️", "↗️", "↘️", "↙️", "↖️", "🔄", "🔁", "🔀"
        ],
    }

    constructor() { }

    toggleChannelPicker() { 
        this._showPickerInChannels = !this._showPickerInChannels; 
    }

    toggleChannelMessagePicker() {
        this._showPickerInChannelMessage =!this._showPickerInChannelMessage;
    }

    closePickerInChannels() { 
        this._showPickerInChannels = false;
        this._activeCategory = 'smileys';
    }

    closePickerInChannelMessage() {
        this._showPickerInChannelMessage = false;
        this._activeCategory = 'smileys';
    }

    selectCategory(cat: string) { 
        this._activeCategory = cat; 
    }

    get showPickerUÍnChannels() { 
        return this._showPickerInChannels;
    }

    get showPickerInChannelMessage() {
        return this._showPickerInChannelMessage;
    }

    get displayedEmojis(): string[] {
        return this.emojis[this._activeCategory] || this.emojis.smileys;
    }
}