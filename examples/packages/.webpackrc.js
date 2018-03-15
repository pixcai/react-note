import path from 'path';

const M = name => path.resolve(__dirname, `src/${name}`);

export default {
  extraBabelPresets: ['@babel/preset-flow'],
  alias: {
    shared: M('shared'),
    'react-dom': M('react-dom'),
    'react-reconciler': M('react-reconciler'),
  },
}

