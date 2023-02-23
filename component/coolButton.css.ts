import { style } from '@vanilla-extract/css'

export const container = style({
  border: '1px solid black',
  padding: '10px 0',
  borderRadius: '5px',
  selectors: {
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.05)',
    },

    '&:active': {
      background: 'rgba(0, 0, 0, 0.3)',
    },
  },
})
