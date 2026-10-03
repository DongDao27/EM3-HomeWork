class character{
    constructor(name, health, power){
        this.name=name;
        this.health=health;
        this.power=power;
    }

    attack(){
        throw new Error("attack() must be implemented");
    }

    defend(){
        throw new Error("defend() must be implemented");
    }

    getInfo(){
        throw new Error("getInfo() must be implemented");
    }
}

class warrior extends character{
    attack(){
        return `swing a sword\n`
    }

    defend(){
        return `raise a shield\n`
    }
    getInfo(){
        return `Warrior: ${this.name}\nHP: ${this.health} \nPower: ${this.power}\n`
    }
}

class mage extends character{
    attack(){
        return `fire a ball\n`
    }

    defend(){
        return `magic shield\n`
    }
    getInfo(){
        return `Warrior: ${this.name}\nHP: ${this.health} \nPower: ${this.power}\n`
    }
}

c1 = new warrior("Dung",100,40)
console.log(c1.getInfo());
console.log(c1.attack());
console.log(c1.defend());

c2 = new mage("The",80,60)
console.log(c2.getInfo());
console.log(c2.attack());
console.log(c2.defend());
