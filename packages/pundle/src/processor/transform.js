'use strict'

/* @flow */

import Path from 'path'
import generate from 'babel-generator'
import * as t from 'babel-types'
import { parse } from 'babylon'
import { traverse, getName } from './helpers'
import { mergeSourceMaps } from './helpers'
import type Pundle from '../index.js'

export default async function transform(
  filePath: string,
  pundle: Pundle,
  { contents, sourceMap }: { contents: string, sourceMap: ?Object }
): Promise<{
  imports: Array<string>,
  contents: string,
  sourceMap: Object
}> {
  const imports = new Set()
  const promises = []
  const ast = parse(contents, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'decorators',
      'classProperties'
    ],
    filename: filePath
  })
  traverse(ast, function(node) {
    if (!node) {
      return false
    }

    if (node.type === 'CallExpression') {
      const name = getName(node.callee)
      if (name === 'require' || name === 'require.resolve') {
        if (name === 'require') {
          node.callee.name = '__require'
        } else {
          node.callee.object.name = '__require'
        }
        const argument = node.arguments[0]
        if (argument && argument.value) {
          promises.push(pundle.path.resolveModule(argument.value, Path.dirname(filePath)).then(function(resolved) {
            argument.value = resolved
            imports.add(resolved)
          }))
        }
      }
    } else if (node.type === 'ImportDeclaration') {
      promises.push(pundle.path.resolveModule(node.source.value, Path.dirname(filePath)).then(function(resolved) {
        node.source.value = resolved
        imports.add(resolved)
      }))
    } else if (node.type === 'MemberExpression') {
      const name = getName(node)
      if (pundle.config.replaceVariables[name]) {
        return pundle.config.replaceVariables[name]
      }
    }
    return false
  })

  await Promise.all(promises)
  if (filePath !== '$internal') {
    ast.program.body.unshift(
      t.variableDeclaration('var', [
        t.variableDeclarator(t.identifier('__dirname'), t.stringLiteral(Path.dirname(filePath))),
        t.variableDeclarator(t.identifier('__filename'), t.stringLiteral(filePath)),
        t.variableDeclarator(t.identifier('__require'), t.callExpression(t.identifier('__sb_pundle_require'), [
          t.stringLiteral(filePath)
        ]))
      ])
    )
  }
  const generated = generate(ast, {
    quotes: 'single',
    filename: filePath,
    sourceMaps: true,
    sourceFileName: filePath
  })
  if (sourceMap) {
    generated.map = mergeSourceMaps(sourceMap, generated.map)
  }

  return {
    imports: Array.from(imports),
    contents: generated.code,
    sourceMap: generated.map
  }
}
