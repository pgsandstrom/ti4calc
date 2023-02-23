import { style } from '@vanilla-extract/css'

export const container = style({
  '@media': {
    '(max-width: 1023px)': {
      display: 'none',
    },
    '(prefers-reduced-motion)': {
      transitionProperty: 'color',
    },
  },
  //   padding: 50,
})

export const imgRight = style({
  maxWidth: '100%',
  height: 'auto',
  float: 'left',
})

export const imgLeft = style([
  imgRight,
  {
    transform: 'scaleX(-1)',
    float: 'right',
  },
])
