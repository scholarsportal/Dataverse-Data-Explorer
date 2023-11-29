export function getSumStatHeader(value: number): string {
    switch (value) {
      case 0:
        return 'Mean'
      case 1:
        return 'Median'
      case 2:
        return 'Mode'
      case 3:
        return 'Minimum'
      case 4:
        return 'Maximum'
      case 5:
        return 'Total Valid Count'
      case 6:
        return 'Total Invalid Count'
      case 7:
        return 'Standard Deviation'
    }
    return '';
  }

export function getSumStatData(index: number, sumStats: {'@_type': string, '#text': string}[]): string {
    if(sumStats.length){
        switch (index) {
            case 0:
                return getText(sumStats?.find((obj: any) => obj['@_type'] === 'mean'))
            case 1:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'medn'))
            case 2:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'mode'))
            case 3:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'min'))
            case 4:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'max'))
            case 5:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'vald'))
            case 6:
                return getText( sumStats.find((obj: any) => obj['@_type'] === 'invd'))
            case 7:
                return getText(sumStats.find((obj: any) => obj['@_type'] === 'stdev'))
        }
    }
    return '';
  }

export function getVariableHeader(value: number): string {
    switch (value) {
      case 0:
        return 'Mean'
      case 1:
        return 'Median'
      case 2:
        return 'Mode'
      case 3:
        return 'Minimum'
      case 4:
        return 'Maximum'
      case 5:
        return 'Total Valid Count'
      case 6:
        return 'Total Invalid Count'
      case 7:
        return 'Standard Deviation'
    }
    return '';
  }

export function getVariableData(index: number, variable: any) {
    console.log(index, variable)
}

function getText(sumStat: {'@_type': string, '#text': string} | undefined): string {
    if(sumStat && sumStat['#text']) { return sumStat['#text'] }
    return ''
}
