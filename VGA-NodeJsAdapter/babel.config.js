module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: '5'
                },
                debug: false,
                useBuiltIns: 'entry',
                corejs: '2.6.11'
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        // [
        //     '@babel/plugin-proposal-decorators',
        //     {
        //         legacy: true
        //     }
        // ],
        '@babel/plugin-proposal-class-properties',
        [
            'module-resolver',
            {
                root: ['./src'],
                alias: {
                    '@src': './src',
                    '@back-src': './back-src',
                    '@config': '../mp3-player-config'
                }
            }
        ]
    ]
};
