import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile, Heart, ThumbsUp, Clock, Coffee, Car, Gift, Music } from 'lucide-react';

const emojiCategories = {
  smileys: {
    name: 'Smileys & Emotion',
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
      '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐'
    ]
  },
  gestures: {
    name: 'People & Body',
    icon: ThumbsUp,
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
      '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦵', '🦿', '🦶',
      '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️',
      '👅', '👄', '💋', '🩸', '👶', '🧒', '👦', '👧', '🧑', '👱'
    ]
  },
  hearts: {
    name: 'Hearts',
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
      '💌', '💒', '💐', '🌹', '🌺', '🌻', '🌷', '🌸', '💮', '🏵️'
    ]
  },
  objects: {
    name: 'Objects',
    icon: Gift,
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
      '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
      '🎛️', '⏰', '🕰️', '⏱️', '⏲️', '⏰', '🕛', '🕧', '🕐', '🕜'
    ]
  },
  food: {
    name: 'Food & Drink',
    icon: Coffee,
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
      '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
      '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕'
    ]
  },
  travel: {
    name: 'Travel & Places',
    icon: Car,
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁', '🛸',
      '🚀', '🛰️', '💺', '🛶', '⛵', '🚤', '🛥️', '🚢', '✈️', '🛩️',
      '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤'
    ]
  },
  activities: {
    name: 'Activities',
    icon: Music,
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
      '🎿', '🎯', '🪀', '🎮', '🎰', '🎲', '🧩', '🎭', '🩰', '🎨'
    ]
  },
  symbols: {
    name: 'Symbols',
    icon: Clock,
    emojis: [
      '❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️',
      '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎',
      '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑'
    ]
  }
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Don't close the picker when selecting an emoji
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col h-96">
          {/* Category tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 p-2 gap-1">
            {Object.entries(emojiCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`p-2 rounded-md transition-colors ${
                    activeCategory === key
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={category.name}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Emoji grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {emojiCategories[activeCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
