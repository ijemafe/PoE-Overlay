import { async, TestBed } from '@angular/core/testing'
import { Item, Language } from '@shared/module/poe/type'
import { SharedModule } from '@shared/shared.module'
import { forkJoin, of } from 'rxjs'
import { flatMap } from 'rxjs/operators'
import { BaseItemTypesService } from '../base-item-types/base-item-types.service'
import { ContextService } from '../context.service'
import { CurrencyService } from '../currency/currency.service'
import { ItemSearchAnalyzeService } from './item-search-analyze.service'
import { ItemSearchService } from './item-search.service'

describe('ItemSearchAnalyzeService', () => {
  let sut: ItemSearchAnalyzeService
  let contextService: ContextService
  let searchService: ItemSearchService
  let currencyService: CurrencyService
  let baseItemTypesService: BaseItemTypesService
  let itemSearchServiceSpy: jasmine.SpyObj<ItemSearchService>

  const mockSearchResult: any = {
    id: 'y35jtR',
    hits: [
      '72fad07c5684c05f543504bf40c1739081e34a3c63f101b1c4477d8547763563',
      '71c98661168b99693db42191c4788f8216a335f095e49fa3d35c49fb200c0f5d',
    ],
    language: Language.English,
    total: 15785,
    url: 'https://www.pathofexile.com/trade/search/Delirum/y35jtR',
  }

  const mockListResult: any = [
    {
      seller: 'Lord_Mohamed',
      indexed: '2020-06-12T13:49:07.000Z',
      currency: {
        id: 'jew',
        nameType: "Jeweller's Orb",
        image:
          '/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png?v=2946b0825af70f796b8f15051d75164d',
      },
      amount: 1,
      age: '4 days ago',
    },
    {
      seller: 'Lord_Mohamed',
      indexed: '2020-06-13T12:54:38.000Z',
      currency: {
        id: 'alch',
        nameType: 'Orb of Alchemy',
        image:
          '/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png?v=89c110be97333995522c7b2c29cae728',
      },
      amount: 1,
      age: '3 days ago',
    },
  ]

  beforeEach((done) => {
    const itemSearchServiceSpyObj = jasmine.createSpyObj('ItemSearchService', ['search', 'list'])

    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [{ provide: ItemSearchService, useValue: itemSearchServiceSpyObj }],
    }).compileComponents()
    sut = TestBed.inject<ItemSearchAnalyzeService>(ItemSearchAnalyzeService)

    itemSearchServiceSpy = TestBed.inject(ItemSearchService) as jasmine.SpyObj<ItemSearchService>

    contextService = TestBed.inject<ContextService>(ContextService)
    contextService
      .init({
        language: Language.English,
      })
      .subscribe(() => done())

    searchService = TestBed.inject<ItemSearchService>(ItemSearchService)
    currencyService = TestBed.inject<CurrencyService>(CurrencyService)
    baseItemTypesService = TestBed.inject<BaseItemTypesService>(BaseItemTypesService)
  })

  it('should return items', (done) => {
    const requestedItem: Item = {
      typeId: baseItemTypesService.search('Topaz Ring'),
    }
    itemSearchServiceSpy.search.and.returnValue(of(mockSearchResult))
    itemSearchServiceSpy.list.and.returnValue(of(mockListResult))

    forkJoin([
      searchService.search(requestedItem).pipe(flatMap((result) => searchService.list(result, 10))),
      currencyService.searchById('chaos'),
    ]).subscribe(
      (results) => {
        sut.analyze(results[0], [results[1]]).subscribe(
          (result) => {
            expect(result.values.median).toBeGreaterThan(0)
            done()
          },
          (error) => {
            done.fail(error)
          }
        )
      },
      (error) => {
        done.fail(error)
      }
    )
  })
})
