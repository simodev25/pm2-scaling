const Pm2Scaling = require('./pm2-scaling')

const autoScale = () => {

    const pm2Scaling = new Pm2Scaling({
        interval : 10,
        instances:[{
            name: 'timer-blockout-example',
            maxReplicas: 20,
            minReplicas: 1,
            maxCpu: 80,
            maxMem: 100,
        },{
            name: 'produce',
            maxReplicas: 20,
            minReplicas: 1,
            maxCpu: 80,
            maxMem: 100,
        }]
    })
    pm2Scaling.autoScale()
}

autoScale()
