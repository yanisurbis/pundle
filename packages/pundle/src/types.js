'use strict'

/* @flow */

import type { Stats } from 'fs'

export type FileSystemInterface = {
  stat: ((path: string) => Promise<Stats>),
  readFile: ((filePath: string) => Promise<string>),
}

export type Config = {
  hmr: boolean,
  entry: Array<string>,
  resolve: Object,
  FileSystem: Function,
  rootDirectory: string,
  replaceVariables: Object // <string, Object>
}

/*
  Here's what we can work with
  type Config = {
    hmr: boolean,
    entry: string | Array<string>,
    resolve?: Object,
    FileSystem?: Function,
    rootDirectory: string,
    sourceMaps?: boolean,
    replaceVariables?: Object // <string, string>
  }
*/

export type Module = {
  imports: Array<string>,
  sources: string,
  contents: string,
  filePath: string,
  sourceMap: Object
}

export type WatcherConfig = {
  ignored: string | RegExp,
  onBeforeCompile?: ((filePath: string) => void),
  onAfterCompile?: ((filePath: string, error: ?Error) => void),
  onReady?: (() => void),
  onError: ((error: Error) => void)
}

/*
  Here's what we can work with
  type WatcherConfig = {
    ignored?: string | RegExp,
    onBeforeCompile?: ((filePath: string) => void),
    onAfterCompile?: ((filePath: string, error: ?Error) => void),
    onReady?: (() => void),
    onError: ((error: Error) => void)
  }
*/

export type ProcessorConfig = {
  append?: string,
  prepend?: string,
  module_register: string
}

export type Plugin = string | Function | [string, Object] | [Function, Object]
export type ArrayDifference<T> = { added: Array<T>, removed: Array<T> }
