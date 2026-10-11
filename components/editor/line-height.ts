import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
                                                                   
                                                                                    
                                                              
          commands.updateAttributes('paragraph', { lineHeight })
          commands.updateAttributes('heading', { lineHeight })
          return true
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          commands.resetAttributes('paragraph', 'lineHeight')
          commands.resetAttributes('heading', 'lineHeight')
          return true
        },
    }
  },
})
