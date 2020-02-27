class Calculator {
    constructor() {
        this.overwrite = true; //overwrite functionality
        this.inputstream = '';
    }

    handleEvent(event) {
        this.button = event.target;
        let _function = this.button.dataset.function;
        let datatype = this.button.dataset.type;

        if (this.button.tagName != "TD") return;        
     
        if(datatype == 'number') {
            this.numpad(this.button.firstChild.data);
           
        }

        if (datatype == 'operator') this.compute(_function);
         
                
    }

    numpad(value){     
         
        this.inputstream += value;
       this.print2Screen(value);
       
        
    }

    compute(value) {
       
    
        switch (value) {
            case 'add':
              this.inputstream += '+';
              screen.innerHTML = '';
              break;
            case 'subtract':
              this.inputstream += '-';
              screen.innerHTML = '';
              break;
            case 'multiply':
              this.inputstream += '*';
              screen.innerHTML = '';
              break;
            case 'divide':
              this.inputstream += '/';
              screen.innerHTML = '';
              break;
            case 'negate':
                this.inputstream = '-' + '(' + this.inputstream + ')';
                screen.innerHTML = '-' + screen.innerHTML;
                break;
            case 'percent':
                this.inputstream += ' * 0.01';
                screen.innerHTML = '';
                break;
            case 'decm-point':
                this.print2Screen('.');
                this.inputstream += '.';
                break;
            case 'clear':
                screen.innerHTML = '0';
                this.overwrite = true;               
                this.inputstream = '';               
                break;
            case 'result':
                this.overwrite = true;
                this.calculate(this.inputstream);
                break;                
      }
              
    }

    calculate(value) {
        
        try {
            if (isNaN(value[0]) && value[0] != '-') value = value.slice(1);
            

            this.input(value)
            let result = eval(value);       
            this.print2Screen(result);
        } catch(e) {
            this.print2Screen(e);
            throw e;
        }             
               
    }

    print2Screen(values) {  
              
        if (values == undefined) values = "Error";
        if (isNaN(values) && values != '.') values = "Error";
        if (values instanceof Error) values = "Error";

        let valueIsNegtv;  

        if (isFinite(values) && values.toString().length > 9) {
            
            if (values < 0) {
                values = values.toString().slice(1);
                valueIsNegtv = true;              
            }
        
            if (values != Math.trunc(values) && values > 1) {
                let first4 = values.toString().slice(0, 5);
                values = first4[0] + '.' + first4[1] + 'e' + (values.toString().length - 1);
    
            } else if ( values > 1) {
                let arr = values.toString().split('').slice(0, 5);
                let num = arr.filter((n) => n != 0);
                if (num.length == 1)  {
                    values = num[0]  + 'e'  + (values.toString().length - 1);
                } else {
                    values = num[0] + '.' + num.slice(1, 5).join('') + 'e'  + (values.toString().length - 1);                    
                }
                
            }else {
                let arr = values.toString().split('');
                let num = arr.filter((n) => n != 0);
                values = num[1] + '.' + num.slice(2, 5).join('') + 'e-' + (arr.length - num.length);
               
            }
            
            if (valueIsNegtv) {
                values = '-'+ values;
                valueIsNegtv = false;
            }
             
        }

        if (this.overwrite) {
            screen.innerHTML = values;
            this.overwrite = false;           
        } else {
            screen.append(values);
        }
                              
                      
    } 

    input(r) {
        subscreen.innerHTML = '<em>last input: ' + r;
    }
}

let calcHandler = new Calculator();
let calc = document.getElementById('calculator');
let screen = document.getElementById('screen');
let subscreen = document.getElementById('subscreen')

calc.addEventListener('click', calcHandler);
