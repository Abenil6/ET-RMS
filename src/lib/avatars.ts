import { createAvatar } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars'
import * as adventurer from '@dicebear/adventurer'
import * as adventurerNeutral from '@dicebear/adventurer-neutral'
import * as bigEars from '@dicebear/big-ears'
import * as bigSmile from '@dicebear/big-smile'
import * as bottts from '@dicebear/bottts'
import * as funEmoji from '@dicebear/fun-emoji'
import * as identicon from '@dicebear/identicon'
import * as lorelei from '@dicebear/lorelei'
import * as micah from '@dicebear/micah'
import * as miniavs from '@dicebear/miniavs'
import * as notionists from '@dicebear/notionists'
import * as openPeeps from '@dicebear/open-peeps'
import * as personas from '@dicebear/personas'
import * as pixelArt from '@dicebear/pixel-art'
import * as shapes from '@dicebear/shapes'
import * as thumbs from '@dicebear/thumbs'

export type AvatarStyle = {
    name: string
    style: any
}

export const AVATAR_STYLES: AvatarStyle[] = [
    { name: 'Avataaars', style: avataaars },
    { name: 'Adventurer', style: adventurer },
    { name: 'Adventurer Neutral', style: adventurerNeutral },
    { name: 'Big Ears', style: bigEars },
    { name: 'Big Smile', style: bigSmile },
    { name: 'Bottts', style: bottts },
    { name: 'Fun Emoji', style: funEmoji },
    { name: 'Identicon', style: identicon },
    { name: 'Lorelei', style: lorelei },
    { name: 'Micah', style: micah },
    { name: 'Miniavs', style: miniavs },
    { name: 'Notionists', style: notionists },
    { name: 'Open Peeps', style: openPeeps },
    { name: 'Personas', style: personas },
    { name: 'Pixel Art', style: pixelArt },
    { name: 'Shapes', style: shapes },
    { name: 'Thumbs', style: thumbs },
]

// Generate random seeds for variety
export const AVATAR_SEEDS = Array.from({ length: 12 }, (_, i) => `seed-${i}`)

export const DEFAULT_AVATAR_STYLE = 'Avataaars'
export const DEFAULT_AVATAR_SEED = 'seed-0'

/**
 * Generate avatar URL from style and seed
 */
export function getAvatarUrl(
    styleName: string = DEFAULT_AVATAR_STYLE,
    seed: string = DEFAULT_AVATAR_SEED,
    size: number = 128
): string {
    const avatarStyle = AVATAR_STYLES.find(s => s.name === styleName)?.style || avataaars

    const avatar = createAvatar(avatarStyle, {
        seed,
        size,
    })

    return avatar.toDataUri()
}

/**
 * Get avatar style object by name
 */
export function getAvatarStyle(styleName: string): AvatarStyle | undefined {
    return AVATAR_STYLES.find(s => s.name === styleName)
}

/**
 * Generate random avatar configuration
 */
export function generateRandomAvatar(): { style: string; seed: string } {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)]
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)]

    return {
        style: randomStyle.name,
        seed: randomSeed,
    }
}

/**
 * Get initials from name as fallback
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}