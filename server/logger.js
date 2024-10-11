const { winston } = require("winston")

const logLevels = {
    levels: {
        error: 0,
        warn:  1,
        info: 2,
        debug: 4
    },
    colors: {
        error: 'red',
        warn:  'yellow',
        info:  'blue',
        debug: 'green'
    }
}
winston.addColors(logLevels.colors)
export const logger = new (winston.Logger)({
    levels: logLevels.levels
})