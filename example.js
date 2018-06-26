import Component from './src/decorators/component-decorator';
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

        setTimeout(()=> {
            this.count++;
            this.setState({
                greet: 'greet'+ this.count
            });
        }, 1000);
    }

    render() {
        return (`
            <div>
            <h1>${this.state.greet}</h1>
            <span class="test" id='spn12'>sample h</span>
            </div>
        `);
    }
}

