export interface UIState {
  bodyToggle: 'cross-tab' | 'variables',
  bodyState: {
    variables: {
      groupSelectedID: string,
      variablesDeclaredMissing: { [variableID: string]: string[] },
      importComponentState: 'open' | 'close',
      variableSelectionContext: {
        [groupID: string]: string[]
      },
      openVariable: {
        variableID: string,
        mode: 'edit' | 'view'
      }
    },
    crossTab: {
      selection: {
        [index: number]: {
          variableID: string,
          orientation: 'rows' | 'cols' | ''
        }
      }
    }
  }
}
