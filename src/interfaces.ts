export interface ActionReaderOptions {
 startAtBlock?: number
 onlyIrreversible?: boolean
}

export interface Block {
  actions: Action[]
  blockInfo: BlockInfo
}

export interface BlockMeta {
  isRollback: boolean
  isEarliestBlock: boolean
  isNewBlock: boolean
}

export interface IndexState {
  blockNumber: number
  lastIrreversibleBlockNumber: number
  blockHash: string
  handlerVersionName: string
  isReplay: boolean
}

export interface BlockInfo {
  blockNumber: number
  blockHash: string
  previousBlockHash: string
  timestamp: Date
}

export interface NextBlock {
  block: Block
  blockMeta: BlockMeta
  lastIrreversibleBlockNumber: number
}

export interface Action {
  type: string
  payload: any
}

export interface ActionListener {
  actionType: string
}

export type ActionCallback = (
  state: any,
  payload: any,
  blockInfo: BlockInfo,
  context: any,
) => void | string | Promise<void> | Promise<string>

export type StatelessActionCallback = (
  payload: any,
  block: Block,
  context: any,
) => void | Promise<void>

export interface Updater extends ActionListener {
  apply: ActionCallback
  revert?: ActionCallback
}

export interface Effect extends ActionListener {
  run: StatelessActionCallback
  deferUntilIrreversible?: boolean
  onRollback?: StatelessActionCallback
}

export interface HandlerVersion {
  versionName: string
  updaters: Updater[]
  effects: Effect[]
}

export interface VersionedAction {
  action: Action
  handlerVersionName: string
}

export type CurriedEffectRun = (
  () => void | Promise<void>
)

export interface DeferredEffects {
  // Block number
  [key: number]: CurriedEffectRun[]
}

export interface HandlerInfo {
  lastProcessedBlockNumber: number
  lastProcessedBlockHash: string
  handlerVersionName: string
}

export interface ReaderInfo {
  currentBlockNumber: number
  startAtBlock: number
  headBlockNumber: number
  onlyIrreversible: boolean
  lastIrreversibleBlockNumber: number
}

export enum IndexingStatus {
  Initial = 'initial',
  Indexing = 'indexing',
  Pausing = 'pausing',
  Paused = 'paused',
  Stopped = 'stopped',
}

export interface DemuxInfo {
  indexingStatus: IndexingStatus
  error?: Error
  handler: HandlerInfo
  reader: ReaderInfo
}
