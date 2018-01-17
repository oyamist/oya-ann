**OyaAnn** is a Javascript library for building, training and using 
artificial neural networks (ANNs) that approximate
and model simple multi-variate relationships. 
**OyaAnn** neural networks can be generated dynamically 
from observational data
according to need and serialized for later use.

Consider, for example, temperature compensation for conductivity
measurements (i.e., EC/PPM). EC/PPM probes are temperature sensitive
and readings will change with temperature. For example, the EC
of a reference solution having EC=1413 microsiemens @ 25&deg;C
may vary as follows 
([Atlas Scientific EC-EZO](https://www.atlas-scientific.com/_files/_datasheets/_circuit/EC_EZO_Datasheet.pdf)):

| &deg;C    | EC   |
| ---- | ---- |
| 5    | 896  |
| 10   | 1020 |
| 15   | 1147 |
| 20   | 1278 |
| 25   | 1413 |
| 30   | 1548 |
| 35   | 1711 |
| 40   | 1860 |
| 45   | 2009 |
| 50   | 2158 |

Moreover, solutions with different dissolved solids will exhibit 
different, non-linear temperature compensation curves.

With **OyaAnn**, we can generate custom temperature compensation ANNs 
for new nutrient solutions and train them with locally observed data. 
Once trained, these ANNs can be archived and re-used as needed.

```js
var examples = [
    new Example([5],[896]),
    new Example([10],[1020]),
    new Example([15],[1147]),
    new Example([20],[1278]),
    new Example([25],[1413]),
    new Example([30],[1548]),
    new Example([35],[1711]),
    new Example([40],[1860]),
    new Example([45],[2009]),
    new Example([50],[2158]),
];
network.train(examples);
```

### Installation
Use `npm` to install oya-ann.

`npm install oya-ann`

### See Also

* [Kinann](https://github.com/firepick/kinann) OyaAnn is a hard fork of Kinann repurposed for OyaMist applications.
* [OyaAnn wiki...](https://github.com/oyamist/oya-ann/wiki)
* [mathjs](http://mathjs.org) many thanks to MathJS for expression parsing and derivatives!

