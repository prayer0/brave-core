/* global describe, it */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  convertBalance,
  convertProbiToFixed,
  setBadgeText
} from '../../../../brave_rewards/resources/extension/brave_rewards/utils'

describe('Rewards Panel extension - Utils', () => {
  describe('convertBalance', () => {
    it('token has letters', () => {
      expect(convertBalance('test', { 'USD': 10 })).toBe('0.00')
    })

    it('rates are empty', () => {
      expect(convertBalance('10', {})).toBe('0.00')
    })

    it('rate is missing', () => {
      expect(convertBalance('10', { 'USD': 10 }, 'EUR')).toBe('0.00')
    })

    it('all good', () => {
      expect(convertBalance('10', { 'USD': 10 })).toBe('100.00')
    })

    it('currency is provided', () => {
      expect(convertBalance('10', { 'USD': 10, 'EUR': 4 }, 'EUR')).toBe('40.00')
    })
  })

  describe('convertProbiToFixed', () => {
    it('probi is not in correct format', () => {
      expect(convertProbiToFixed('sdfs')).toBe('0.0')
    })

    it('probi is not 10^18', () => {
      expect(convertProbiToFixed('9')).toBe('0.0')
    })

    it('we should always round down', () => {
      expect(convertProbiToFixed('0999999999999999999')).toBe('0.9')
    })

    it('regular convert', () => {
      expect(convertProbiToFixed('1559999999999999990')).toBe('1.5')
    })

    it('regular convert two places', () => {
      expect(convertProbiToFixed('1559999999999999990', 2)).toBe('1.55')
    })

    it('big convert', () => {
      expect(convertProbiToFixed('150000000000000000000000000')).toBe('150000000.0')
    })
  })

  describe('setBadgeText', () => {
    let spyText: jest.SpyInstance
    let spyColor: jest.SpyInstance

    beforeEach(() => {
      spyText = jest.spyOn(chrome.browserAction, 'setBadgeText')
      spyColor = jest.spyOn(chrome.browserAction, 'setBadgeBackgroundColor')
    })

    afterEach(() => {
      spyText.mockRestore()
      spyColor.mockRestore()
    })

    it('publisher is not verified, no pending notifications', () => {
      const state: RewardsExtension.State = {
        notifications: {}
      }

      setBadgeText(state)

      expect(spyText).toHaveBeenCalled()
      expect(spyText.mock.calls[0][0]).toEqual({
        text: ''
      })
    })

    it('publisher is not verified, pending notifications', () => {
      const state: RewardsExtension.State = {
        notifications: {
          '1': {
            id: 'test'
          }
        }
      }

      setBadgeText(state)

      expect(spyText).toHaveBeenCalled()
      expect(spyText.mock.calls[0][0]).toEqual({
        text: '1'
      })
    })

    it('publisher is verified, no pending notifications', () => {
      const state: RewardsExtension.State = {
        notifications: {}
      }

      setBadgeText(state, true, 1)

      expect(spyText).toHaveBeenCalled()
      const data = spyText.mock.calls[0][0]
      expect(data.tabId).toEqual(1)
      expect(data.text).toEqual('✓️')

      expect(spyColor).toHaveBeenCalled()
      expect(spyColor.mock.calls[0][0]).toEqual({
        color: '#4C54D2',
        tabId: 1
      })
    })

    it('publisher is verified, pending notifications', () => {
      const state: RewardsExtension.State = {
        notifications: {
          '1': {
            id: 'test'
          }
        }
      }

      setBadgeText(state, true, 1)

      expect(spyText).toHaveBeenCalled()
      const data = spyText.mock.calls[0][0]
      expect(data.tabId).toEqual(1)
      expect(data.text).toEqual('✓️')

      expect(spyColor).toHaveBeenCalled()
      expect(spyColor.mock.calls[0][0]).toEqual({
        color: '#4C54D2',
        tabId: 1
      })
    })

    it('publisher is not verified with tabId, pending notifications', () => {
      const state: RewardsExtension.State = {
        notifications: {
          '1': {
            id: 'test'
          }
        }
      }

      setBadgeText(state, false, 1)

      expect(spyText).toHaveBeenCalled()
      expect(spyText.mock.calls[0][0]).toEqual({
        text: '1',
        tabId: 1
      })

      expect(spyColor).toHaveBeenCalled()
      expect(spyColor.mock.calls[0][0]).toEqual({
        color: '#FB542B',
        tabId: 1
      })
    })
  })
})
