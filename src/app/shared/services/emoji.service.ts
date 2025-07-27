import {
    Injectable,
    ElementRef,
    ViewChild,
    HostListener
} from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class EmojiService {
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
    activeEmojiCategory: string = 'Smiley';
    showEmojiPicker = true;

    constructor() { }

    @ViewChild('emojiPicker') emojiPicker!: ElementRef<HTMLElement>;

    selectEmojiCategory(category: string) {
        this.activeEmojiCategory = category;
    }

    get displayedEmojis(): string[] {
        return this.emojis[this.activeEmojiCategory] || this.emojis["smileys"];
    }

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent) {
        if (this.showEmojiPicker &&
            this.emojiPicker &&
            !this.emojiPicker.nativeElement.contains(event.target as Node)) {
            this.showEmojiPicker = false
        }
    }
}