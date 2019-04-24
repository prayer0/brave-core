/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import BigNumber from 'bignumber.js'

export const convertBalance = (tokens: string, rates: Record<string, number> | undefined, currency: string = 'USD'): string => {
  const tokensNum = parseFloat(tokens)
  if (tokensNum === 0 || !rates || !rates[currency]) {
    return '0.00'
  }

  const converted = tokensNum * rates[currency]

  if (isNaN(converted)) {
    return '0.00'
  }

  return converted.toFixed(2)
}

export const formatConverted = (converted: string, currency: string = 'USD'): string | null => {
  return `${converted} ${currency}`
}

export const convertProbiToFixed = (probi: string, places: number = 1) => {
  const result = new BigNumber(probi).dividedBy('1e18').toFixed(places, BigNumber.ROUND_DOWN)

  if (result === 'NaN') {
    return '0.0'
  }

  return result
}

export const getGrants = (grants?: RewardsExtension.Grant[]) => {
  if (!grants) {
    return []
  }

  return grants.map((grant: RewardsExtension.Grant) => {
    let expireDate = ''
    if (grant.type !== 'ads') {
      expireDate = new Date(grant.expiryTime * 1000).toLocaleDateString()
    }

    return {
      tokens: convertProbiToFixed(grant.probi),
      expireDate
    }
  })
}

export const getGrant = (grant?: RewardsExtension.GrantInfo) => {
  if (grant && grant.type === 'ads') {
    grant.expiryTime = 0
  }

  return grant
}

export const setBadgeText = (state: RewardsExtension.State, verified: boolean = false, tabId: number = -1) => {
  let text = ''

  if (state && state.notifications && !verified) {
    const count = Object.keys(state.notifications).length
    if (count > 0) {
      text = count.toString()
    }
  }

  let data: chrome.browserAction.BadgeTextDetails = {
    text
  }

  if (tabId !== -1) {
    data.tabId = tabId
    chrome.browserAction.setBadgeBackgroundColor({
      color: verified ? '#4C54D2' : '#FB542B',
      tabId
    })

    if (verified) {
      data.text = '✓️'
    }

  } else {
    chrome.browserAction.setBadgeBackgroundColor({
      color: '#FB542B'
    })
  }

  chrome.browserAction.setBadgeText(data)
}
