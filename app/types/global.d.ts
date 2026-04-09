import type { MessageApiInjection } from 'naive-ui/lib/message/src/MessageProvider'
declare global {
 interface Window {
   $message: MessageApiInjection
 }
 interface ApiResult<T> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: number
}
interface PageResult<T> {
  total: number
  pageNum: number
  pageSize: number
  list: T[]
}
}