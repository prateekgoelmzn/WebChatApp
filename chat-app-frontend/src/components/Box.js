import React from 'react';
import './Box.css';

let Box = (props)=><button className='box l r t b' onClick={props.handleClick}>
    {props.value}
</button>

export default Box;