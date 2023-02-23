import { globalStyle, style } from '@vanilla-extract/css'

export const container = style({
  // its good if animation time is lower than MIN_TIME_BETWEEN_SENDING_UPDATES, to avoid jerky animations
  transition: 'flex-grow 240ms',
})

globalStyle(`${container} > *`, {
  textAlign: 'center',
})
