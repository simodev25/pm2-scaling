const PM2 = require('pm2/lib/API');
const pm2 = new PM2();
const formateMemory = require('./convertMemory')

class Pm2Scalin {

    constructor(config) {
        this.config = config
        this.instancesMonit = new Map()
        const instances = this.config.instances
        for (const instancesElement of instances) {
            if (!instancesElement.minReplicas) {
                instancesElement.minReplicas = 1
            }
            if (!instancesElement.maxReplicas) {
                instancesElement.maxReplicas = 20
            }
            this.instancesMonit.set(instancesElement.name, instancesElement)
        }
        this.monit()

    }

    getDescribe(instanceName) {
        return new Promise((resolve) => {
            pm2.describe(instanceName, (err, instances) => {
                if (err) resolve(err)
                resolve(instances)
            })
        })
    }

    async scaleInstance(instanceName, currentReplicas, desiredReplicas) {
        return new Promise((resolve) => {
            desiredReplicas = desiredReplicas < this.instancesMonit.get(instanceName).minReplicas ? this.instancesMonit.get(instanceName).minReplicas : desiredReplicas > this.instancesMonit.get(instanceName).maxReplicas ? this.instancesMonit.get(instanceName).maxReplicas : desiredReplicas
            if (desiredReplicas == currentReplicas) {
                resolve(instanceName)
                return
            }
            console.log('desiredReplicas', desiredReplicas)
            pm2.scale(instanceName, desiredReplicas, (err, instances) => {
                if (err) resolve(err)
                resolve(instances)
            })
        })
    }

    autoScale() {
        setInterval(async () => {

            const instances = this.config.instances
            for (const instancesElement of instances) {
                const instances = await this.getDescribe(instancesElement.name);
                //desiredReplicas = ceil[currentReplicas * ( currentMetricValue / desiredMetricValue )]
                const currentReplicas = instances.length
                const desiredReplicasCpu = Math.ceil(currentReplicas * (this.instancesMonit.get(instancesElement.name).cpu  / this.instancesMonit.get(instancesElement.name).maxCpu))
                const desiredReplicasMem = Math.ceil(currentReplicas * (this.instancesMonit.get(instancesElement.name).mem / this.instancesMonit.get(instancesElement.name).maxMem))
                console.log('desiredReplicasCpu', desiredReplicasCpu, 'cpu', this.instancesMonit.get(instancesElement.name).cpu)
                console.log('desiredReplicasMem', desiredReplicasMem, 'mem', this.instancesMonit.get(instancesElement.name).mem)

                await this.scaleInstance(instancesElement.name, currentReplicas, Math.max(desiredReplicasCpu,desiredReplicasMem))


            }


        }, (this.config.interval || 10) * 1000);
    }


    monit() {
        setInterval(async () => {
            const instances = this.config.instances
            for (const instancesElement of instances) {
                const instances = await this.getDescribe(instancesElement.name);
                this.instancesMonit.get(instancesElement.name).currentReplicas = instances.length
                if (instances) {
                    let cpu = 0
                    let mem = 0
                    instances.forEach((instance) => {
                        cpu += instance.monit.cpu
                        mem += instance.monit.memory
                    })
                    this.instancesMonit.get(instancesElement.name).cpu = cpu / instances.length
                    this.instancesMonit.get(instancesElement.name).mem = formateMemory(mem) / instances.length
                }
            }
            console.log(this.instancesMonit.values())
        }, 1500);
    }

}


module.exports = Pm2Scalin


