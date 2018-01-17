**oya-ann** is a Javascript library for building, training and using 
artificial neural networks (ANNs) that can be used to approximate
and model simple multi-variate relationships. 
**oya-ann** neural networks can be generated dynamically 
from observational data
according to need and serialized for later use.

Consider, for example, temperature compensation for conductivity
measurements (i.e., EC/PPM). EC/PPM probes are temperature sensitive
and readings will change with temperature. For example, the EC
of a reference solution having EC=1413 microsiemens @ 25C
may vary as follows 
([Atlas Scientific EC-EZO](https://www.atlas-scientific.com/_files/_datasheets/_circuit/EC_EZO_Datasheet.pdf)):

| C    | EC   |
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
different temperature compensation curves.

With **oya-ann**, we can generate custom temperature compensation ANNs 
for new nutrient solutions and train them with locally observed data. These
ANNs can then be archived and re-used as needed.

### Installation
Use `npm` to install oya-ann.

`npm install oya-ann`

### See Also

* [OyaAnn wiki...](https://github.com/firepick/oya-ann/wiki)
* [mathjs](http://mathjs.org) many thanks to MathJS for expression parsing and derivatives!

