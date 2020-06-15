import {TestBed} from '@angular/core/testing'
import {Item, Language} from '@shared/module/poe/type'
import {SharedModule} from '@shared/shared.module'
import {BaseItemTypesService} from '../base-item-types/base-item-types.service'
import {ContextService} from '../context.service'
import {ItemSearchService} from './item-search.service'
import {TradeHttpService, TradeSearchResponse} from '@data/poe';
import { of } from 'rxjs'

describe('ItemSearchService', () => {
  let sut: ItemSearchService
  let contextService: ContextService
  let baseItemTypesService: BaseItemTypesService
  let tradeServiceSpy: jasmine.SpyObj<TradeHttpService>

  const mockLeagues: any = require('doc/poe/api_trade_data_leagues.json')
  const mockStatic: any = require('doc/poe/api_trade_data_static.json')
  const mockSearchResult: TradeSearchResponse = {
    id: 'y35jtR',
    result: [
      '72fad07c5684c05f543504bf40c1739081e34a3c63f101b1c4477d8547763563',
      '71c98661168b99693db42191c4788f8216a335f095e49fa3d35c49fb200c0f5d',
    ],
    total: 15785,
    url: 'https://www.pathofexile.com/trade/search/Delirum/y35jtR',
  }
  const mockFetchResult = {
    'result': [
      {
        'id': '72fad07c5684c05f543504bf40c1739081e34a3c63f101b1c4477d8547763563',
        'listing': {
          'method': 'psapi',
          'indexed': '2020-06-12T13:49:07Z',
          'stash': {'name': 'Valuable', 'x': 1, 'y': 1},
          'whisper': '@lord_mOHAMED_HERO Hi, I would like to buy your Sorrow Twirl Topaz Ring listed for 1 jew in Delirium (stash tab \'Valuable\'; position: left 2, top 2)',
          'account': {
            'name': 'Lord_Mohamed',
            'lastCharacterName': 'lord_mOHAMED_HERO',
            'online': {'league': 'Delirium'},
            'language': 'en_US'
          },
          'price': {'type': '~price', 'amount': 1, 'currency': 'jew'}
        },
        'item': {
          'verified': true,
          'w': 1,
          'h': 1,
          'icon': 'https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Rings\/Ring5.png?w=1&h=1&scale=1&v=d645f9adfc012c52674c94d16b4292b2',
          'league': 'Delirium',
          'name': 'Sorrow Twirl',
          'typeLine': 'Topaz Ring',
          'identified': true,
          'ilvl': 14,
          'note': '~price 1 jew',
          'requirements': [{'name': 'Level', 'values': [['12', 0]], 'displayMode': 0}],
          'implicitMods': ['+26% to Lightning Resistance'],
          'explicitMods': ['Adds 3 to 8 Cold Damage to Attacks', 'Adds 1 to 15 Lightning Damage to Attacks', '+16 to maximum Life', 'Regenerate 2 Life per second', '10% increased Rarity of Items found', '+6% to Lightning Resistance'],
          'frameType': 2,
          'extended': {
            'mods': {
              'implicit': [{
                'name': '',
                'tier': '',
                'magnitudes': [{'hash': 'implicit.stat_1671376347', 'min': 20, 'max': 30}]
              }],
              'explicit': [{
                'name': 'Healthy',
                'tier': 'P7',
                'magnitudes': [{'hash': 'explicit.stat_3299347043', 'min': 10, 'max': 19}]
              }, {
                'name': 'of the Cloud',
                'tier': 'S8',
                'magnitudes': [{'hash': 'explicit.stat_1671376347', 'min': 6, 'max': 11}]
              }, {
                'name': 'Chilled',
                'tier': 'P8',
                'magnitudes': [{
                  'hash': 'explicit.stat_4067062424',
                  'min': 3,
                  'max': 4
                }, {'hash': 'explicit.stat_4067062424', 'min': 7, 'max': 8}]
              }, {
                'name': 'of Plunder',
                'tier': 'S4',
                'magnitudes': [{'hash': 'explicit.stat_3917489142', 'min': 6, 'max': 10}]
              }, {
                'name': 'Buzzing',
                'tier': 'P8',
                'magnitudes': [{
                  'hash': 'explicit.stat_1754445556',
                  'min': 1,
                  'max': 1
                }, {'hash': 'explicit.stat_1754445556', 'min': 14, 'max': 15}]
              }, {
                'name': 'of the Newt',
                'tier': 'S7',
                'magnitudes': [{'hash': 'explicit.stat_3325883026', 'min': 1, 'max': 2}]
              }]
            },
            'hashes': {
              'implicit': [['implicit.stat_1671376347', [0]]],
              'explicit': [['explicit.stat_4067062424', [2]], ['explicit.stat_1754445556', [4]], ['explicit.stat_3299347043', [0]], ['explicit.stat_3325883026', [5]], ['explicit.stat_3917489142', [3]], ['explicit.stat_1671376347', [1]]]
            },
            'text': 'UmFyaXR5OiBSYXJlDQpTb3Jyb3cgVHdpcmwNClRvcGF6IFJpbmcNCi0tLS0tLS0tDQpSZXF1aXJlbWVudHM6DQpMZXZlbDogMTINCi0tLS0tLS0tDQpJdGVtIExldmVsOiAxNA0KLS0tLS0tLS0NCisyNiUgdG8gTGlnaHRuaW5nIFJlc2lzdGFuY2UgKGltcGxpY2l0KQ0KLS0tLS0tLS0NCkFkZHMgMyB0byA4IENvbGQgRGFtYWdlIHRvIEF0dGFja3MNCkFkZHMgMSB0byAxNSBMaWdodG5pbmcgRGFtYWdlIHRvIEF0dGFja3MNCisxNiB0byBtYXhpbXVtIExpZmUNClJlZ2VuZXJhdGUgMiBMaWZlIHBlciBzZWNvbmQNCjEwJSBpbmNyZWFzZWQgUmFyaXR5IG9mIEl0ZW1zIGZvdW5kDQorNiUgdG8gTGlnaHRuaW5nIFJlc2lzdGFuY2UNCi0tLS0tLS0tDQpOb3RlOiB+cHJpY2UgMSBqZXcNCg=='
          }
        }
      },
      {
        'id': '71c98661168b99693db42191c4788f8216a335f095e49fa3d35c49fb200c0f5d',
        'listing': {
          'method': 'psapi',
          'indexed': '2020-06-13T12:54:38Z',
          'stash': {'name': '~price', 'x': 9, 'y': 9},
          'whisper': '@lord_mOHAMED_HERO Hi, I would like to buy your Loath Coil Topaz Ring listed for 1 alch in Delirium (stash tab \'~price\'; position: left 10, top 10)',
          'account': {
            'name': 'Lord_Mohamed',
            'lastCharacterName': 'lord_mOHAMED_HERO',
            'online': {'league': 'Delirium'},
            'language': 'en_US'
          },
          'price': {'type': '~price', 'amount': 1, 'currency': 'alch'}
        },
        'item': {
          'verified': true,
          'w': 1,
          'h': 1,
          'icon': 'https:\/\/web.poecdn.com\/image\/Art\/2DItems\/Rings\/Ring5.png?w=1&h=1&scale=1&v=d645f9adfc012c52674c94d16b4292b2',
          'league': 'Delirium',
          'name': 'Loath Coil',
          'typeLine': 'Topaz Ring',
          'identified': true,
          'ilvl': 70,
          'note': '~price 1 alch',
          'requirements': [{'name': 'Level', 'values': [['52', 0]], 'displayMode': 0}],
          'implicitMods': ['+23% to Lightning Resistance'],
          'explicitMods': ['+42 to Dexterity', 'Adds 4 to 7 Physical Damage to Attacks', 'Adds 20 to 36 Fire Damage to Attacks', '+5% to all Elemental Resistances', '+26% to Cold Resistance'],
          'frameType': 2,
          'extended': {
            'mods': {
              'implicit': [{
                'name': '',
                'tier': '',
                'magnitudes': [{'hash': 'implicit.stat_1671376347', 'min': 20, 'max': 30}]
              }],
              'explicit': [{
                'name': 'Polished',
                'tier': 'P4',
                'magnitudes': [{
                  'hash': 'explicit.stat_3032590688',
                  'min': 3,
                  'max': 4
                }, {'hash': 'explicit.stat_3032590688', 'min': 6, 'max': 7}]
              }, {
                'name': 'of the Crystal',
                'tier': 'S5',
                'magnitudes': [{'hash': 'explicit.stat_2901986750', 'min': 3, 'max': 5}]
              }, {
                'name': 'of the Yeti',
                'tier': 'S5',
                'magnitudes': [{'hash': 'explicit.stat_4220027924', 'min': 24, 'max': 29}]
              }, {
                'name': 'of the Jaguar',
                'tier': 'S3',
                'magnitudes': [{'hash': 'explicit.stat_3261801346', 'min': 38, 'max': 42}]
              }, {
                'name': 'Blasting',
                'tier': 'P2',
                'magnitudes': [{
                  'hash': 'explicit.stat_1573130764',
                  'min': 16,
                  'max': 22
                }, {'hash': 'explicit.stat_1573130764', 'min': 32, 'max': 38}]
              }]
            },
            'hashes': {
              'implicit': [['implicit.stat_1671376347', [0]]],
              'explicit': [['explicit.stat_3261801346', [3]], ['explicit.stat_3032590688', [0]], ['explicit.stat_1573130764', [4]], ['explicit.stat_2901986750', [1]], ['explicit.stat_4220027924', [2]]]
            },
            'text': 'UmFyaXR5OiBSYXJlDQpMb2F0aCBDb2lsDQpUb3BheiBSaW5nDQotLS0tLS0tLQ0KUmVxdWlyZW1lbnRzOg0KTGV2ZWw6IDUyDQotLS0tLS0tLQ0KSXRlbSBMZXZlbDogNzANCi0tLS0tLS0tDQorMjMlIHRvIExpZ2h0bmluZyBSZXNpc3RhbmNlIChpbXBsaWNpdCkNCi0tLS0tLS0tDQorNDIgdG8gRGV4dGVyaXR5DQpBZGRzIDQgdG8gNyBQaHlzaWNhbCBEYW1hZ2UgdG8gQXR0YWNrcw0KQWRkcyAyMCB0byAzNiBGaXJlIERhbWFnZSB0byBBdHRhY2tzDQorNSUgdG8gYWxsIEVsZW1lbnRhbCBSZXNpc3RhbmNlcw0KKzI2JSB0byBDb2xkIFJlc2lzdGFuY2UNCi0tLS0tLS0tDQpOb3RlOiB+cHJpY2UgMSBhbGNoDQo='
          }
        }
      }
    ]
  }

  beforeEach((done) => {
    const tradeServiceSpyObj = jasmine.createSpyObj('TradeHttpService', [
      'search',
      'fetch',
      'getStats',
      'getStatic',
      'getLeagues',
      'getItems',
    ])

    TestBed.configureTestingModule({
      imports: [
        SharedModule,
      ],
      providers: [
        { provide: TradeHttpService, useValue: tradeServiceSpyObj },
      ]
    }).compileComponents()

    tradeServiceSpy = TestBed.inject(TradeHttpService) as jasmine.SpyObj<TradeHttpService>
    tradeServiceSpy.getLeagues.and.returnValue(of(mockLeagues))
    sut = TestBed.inject<ItemSearchService>(ItemSearchService)

    contextService = TestBed.inject<ContextService>(ContextService)
    contextService
      .init({
        language: Language.English,
        leagueId: 'Delirium',
      })
      .subscribe(() => done())
    baseItemTypesService = TestBed.inject<BaseItemTypesService>(BaseItemTypesService)
  })

  it('should return items', (done) => {
    const requestedItem: Item = {
      typeId: baseItemTypesService.search('Topaz Ring', 1),
    }
    tradeServiceSpy.search.and.returnValue(of(mockSearchResult))

    sut.search(requestedItem, { language: Language.English}).subscribe(
      (result) => {
        expect(result.hits.length).toBeGreaterThan(0)
        done()
      },
      (error) => {
        done.fail(error)
      }
    )
  })

  it('should list items from search', (done) => {
    const requestedItem: Item = {
      typeId: baseItemTypesService.search('Topaz Ring', 1),
    }
    tradeServiceSpy.search.and.returnValue(of(mockSearchResult))
    tradeServiceSpy.fetch.and.returnValue(of(mockFetchResult))
    tradeServiceSpy.getStatic.and.returnValue(of(mockStatic))

    sut.search(requestedItem, { language: Language.English, leagueId: 'Delirium' }).subscribe(
      (result) => {
        expect(result.hits.length).toBeGreaterThan(0)

        sut.list(result, 2).subscribe(
          (listings) => {
            expect(listings.length).toBe(Math.min(result.hits.length, 2))

            done()
          },
          (error) => done.fail(error)
        )
      },
      (error) => done.fail(error)
    )
  })
})
