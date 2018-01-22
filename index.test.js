'use strict';
const inject = require('./index');
const cloneDeep = require('lodash.clonedeep');

const mockDevelopmentConfig = require('./mock/development.config');
const mockProductionConfig = require('./mock/production.config');

describe('CSS Modules rewire', () => {
  describe('CSS loaders', () => {
    describe('development', () => {
      const config = cloneDeep(mockDevelopmentConfig);
      const result = inject(config);

      const cssLoader = result.module.rules[1].oneOf[2];
      const cssModulesLoader = result.module.rules[1].oneOf[3];

      it('should exclude modules from the regular loader', () => {
        expect(cssLoader.exclude).toEqual(/\.module\.css$/)
      });

      it('should leave the regular loader configuration intact', () => {
        expect(cssLoader.use[1].options).toEqual({
          importLoaders: 1
        })
      });

      it('should create a modules loader', () => {
        expect(cssModulesLoader.exclude).toBeUndefined();
        expect(cssModulesLoader.use[1].options).toEqual({
          importLoaders: 1,
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        })
      })
    });

    describe('production', () => {
      const config = cloneDeep(mockProductionConfig);
      const result = inject(config);

      const cssLoader = result.module.rules[1].oneOf[2];
      const cssModulesLoader = result.module.rules[1].oneOf[3];

      it('should exclude modules from the regular loader', () => {
        expect(cssLoader.exclude).toEqual(/\.module\.css$/)
      });

      it('should leave the regular loader configuration intact', () => {
        expect(cssLoader.loader[2].options).toEqual({
          importLoaders: 1,
          minimize: true,
          sourceMap: true
        })
      });

      it('should create a modules loader', () => {
        expect(cssModulesLoader.exclude).toBeUndefined();
        expect(cssModulesLoader.loader[2].options).toEqual({
          importLoaders: 1,
          minimize: true,
          sourceMap: true,
          modules: true,
          localIdentName: '[local]___[hash:base64:5]'
        })
      })
    })
  });

  describe('SASS loaders', () => {
    describe('development', () => {
      const config = cloneDeep(mockDevelopmentConfig);
      const result = inject(config, null, {sass: true});

      const cssLoader = result.module.rules[1].oneOf[2];
      const cssModulesLoader = result.module.rules[1].oneOf[3];
      const sassLoader = result.module.rules[1].oneOf[4];
      const sassModulesLoader = result.module.rules[1].oneOf[5];

      describe('regular loader', () => {
        it('should configure a regular loader', () => {
          expect(sassLoader.test).toEqual(/\.s[ac]ss$/);
          expect(sassLoader.exclude).toEqual(/\.module\.s[ac]ss$/)
        });
        it('should build upon the CSS loader', () => {
          expect(sassLoader.use.slice(0, 3)).toEqual(cssLoader.use)
        });
        it('should append the sass-loader', () => {
          expect(sassLoader.use[3]).toContain('/sass-loader/')
        })
      });

      describe('modules loader', () => {
        it('should configure a modules loader', () => {
          expect(sassModulesLoader.test).toEqual(/\.module\.s[ac]ss$/)
        });
        it('should build upon the CSS loader', () => {
          expect(sassModulesLoader.use.slice(0, 3)).toEqual(
              cssModulesLoader.use)
        });
        it('should append the sass-loader', () => {
          expect(sassModulesLoader.use[3]).toContain('/sass-loader/')
        })
      })
    });

    describe('production', () => {
      const config = cloneDeep(mockProductionConfig);
      const result = inject(config, null, {sass: true});

      const cssLoader = result.module.rules[1].oneOf[2];
      const cssModulesLoader = result.module.rules[1].oneOf[3];
      const sassLoader = result.module.rules[1].oneOf[4];
      const sassModulesLoader = result.module.rules[1].oneOf[5];

      describe('regular loader', () => {
        it('should configure a regular loader', () => {
          expect(sassLoader.test).toEqual(/\.s[ac]ss$/);
          expect(sassLoader.exclude).toEqual(/\.module\.s[ac]ss$/)
        });
        it('should build upon the CSS loader', () => {
          expect(sassLoader.loader.slice(0, 4)).toEqual(cssLoader.loader)
        });
        it('should append the sass-loader', () => {
          expect(sassLoader.loader[4]).toContain('/sass-loader/')
        })
      });

      describe('modules loader', () => {
        it('should configure the test regex', () => {
          expect(sassModulesLoader.test).toEqual(/\.module\.s[ac]ss$/)
        });

        it('should build upon the CSS loader', () => {
          expect(sassModulesLoader.loader.slice(0, 4)).toEqual(
              cssModulesLoader.loader)
        });

        it('should append the sass-loader', () => {
          expect(sassModulesLoader.loader[4]).toContain('/sass-loader/')
        })
      })
    })
  })
});
