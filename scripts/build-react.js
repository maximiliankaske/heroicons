const fs = require('fs').promises
const dedent = require('dedent')
const camelcase = require('camelcase')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const svgr = require('@svgr/core').default
const esbuild = require('esbuild')

console.log(svgr)

function svgToReact(svg, componentName) {
  return svgr(svg, {}, { componentName })
}

console.log('Building React components...')

rimraf('./react/outline/*')
  .then(() => {
    return rimraf('./react/solid/*')
  })
  .then(() => {
    return Promise.all([
      fs.readdir('./solid').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./solid/${file}`, 'utf8')
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`)
              })
              .then((component) => {
                return esbuild.transform(component, {
                  loader: 'jsx',
                  target: 'es5',
                  format: 'cjs',
                })
              })
              .then((transformedComponent) => transformedComponent.code)
              .then((component) => {
                const fileName = `${componentName}.jsx`
                const content = component
                return fs.writeFile(`./react/solid/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}'`
            })
            .join('\n')

          const typingsHeader = 'type IconProps = Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "fill" | "stroke">\n'
          const typings = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export function ${componentName}(props: IconProps): JSX.Element`
            })
            .join('\n')

          return fs.writeFile('./react/solid/index.d.ts', typingsHeader + typings).then(() => exportStatements)
        }).then((exportStatements) => {
          return esbuild.transform(exportStatements, {
            target: 'es5',
            format: 'cjs',
          })
        }).then((transformedIndex) => transformedIndex.code)
        .then((exportStatements) => {
          return fs.writeFile('./react/solid/index.js', exportStatements)
        })
      }),

      fs.readdir('./outline').then((files) => {
        return Promise.all(
          files.map((file) => {
            const componentName = `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}`
            return fs
              .readFile(`./outline/${file}`, 'utf8')
              .then((content) => {
                return svgToReact(content, `${componentName}Icon`)
              })
              .then((component) => {
                return esbuild.transform(component, {
                  loader: 'jsx',
                  target: 'es5',
                  format: 'cjs',
                })
              })
              .then((transformedComponent) => transformedComponent.code)
              .then((component) => {
                const fileName = `${componentName}.jsx`
                const content = component
                return fs.writeFile(`./react/outline/${fileName}`, content).then(() => fileName)
              })
          })
        ).then((fileNames) => {
          const exportStatements = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export { default as ${componentName} } from './${fileName}'`
            })
            .join('\n')

          const typingsHeader = 'type IconProps = Omit<React.SVGProps<SVGSVGElement>, "viewBox" | "fill" | "stroke">\n'
          const typings = fileNames
            .map((fileName) => {
              const componentName = `${camelcase(fileName.replace(/\.jsx$/, ''), {
                pascalCase: true,
              })}`
              return `export function ${componentName}(props: IconProps): JSX.Element`
            })
            .join('\n')

          return fs.writeFile('./react/outline/index.d.ts', typingsHeader + typings).then(() => exportStatements)
        }).then((exportStatements) => {
          return esbuild.transform(exportStatements, {
            target: 'es5',
            format: 'cjs',
          })
        }).then((transformedIndex) => transformedIndex.code)
        .then((exportStatements) => {
          return fs.writeFile('./react/outline/index.js', exportStatements)
        })
      }),
    ])
  })
  .then(() => console.log('Finished building React components.'))
