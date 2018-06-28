import { Component } from './src/decorators/component-decorator';
import LiteteComponent from './src/webComponent';

@Component({
    selector: 'test-ele'
})
class TestElement extends LiteteComponent {
    constructor() {
        super();
        this.state = {
            greet: 'hi'
        }

        this.count = 0;

        setTimeout(() => {
            this.count++;
            this.setState((prevState) => {
                return {
                    greet: prevState.greet + this.count
                }
            });
        }, 1000);

        this.greeting = this.greeting.bind(this);
    }

    greeting() {
        alert(this.state.greet);
    }

    render() {
        return (`
            <div>
            <h1>${this.state.greet}</h1>
            <span class="test" id='spn12' onClick='greeting'>sample h</span>
            <test-elem greet='state.greet' greeting='greeting'></test-elem>
            </div>
        `);
    }
}

@Component({
    selector: 'test-elem'
})
class TestElement1 extends LiteteComponent {
    constructor() {
        super();
    }

    greet() {
        this.props.greeting();
    }

    render() {
        return (`
            <div>
            <div onClick='greet'>${this.props.greet}</div>
            <div>static</div>
            </div>
        `)
    }
}