import { convertRawToOHLCV } from '../../utils/csvparse'

const RAW_DATA = [
    { date:"2010.11.01", time:"00:00:00", open:1.41632, high:1.41969, low:1.41243, close:1.41441, volume:16372 },
    { date:"2010.11.01", time:"04:00:00", open:1.41441, high:1.41609, low:1.41083, close:1.41198, volume:12717 },
    { date:"2010.11.01", time:"08:00:00", open:1.41198, high:1.41333, low:1.40990, close:1.41007, volume:14293 },
    { date:"2010.11.01", time:"12:00:00", open:1.41006, high:1.41071, low:1.40456, close:1.40582, volume:17512 },
    { date:"2010.11.01", time:"16:00:00", open:1.40581, high:1.41154, low:1.40553, close:1.40852, volume:15685 },
    { date:"2010.11.01", time:"20:00:00", open:1.40849, high:1.40911, low:1.40543, close:1.40687, volume:11900 },
    { date:"2010.11.02", time:"00:00:00", open:1.40694, high:1.40775, low:1.39400, close:1.39508, volume:14002 },
    { date:"2010.11.02", time:"04:00:00", open:1.39497, high:1.39699, low:1.39279, close:1.39379, volume:15078 },
    { date:"2010.11.02", time:"08:00:00", open:1.39388, high:1.39997, low:1.39265, close:1.39887, volume:16208 },
    { date:"2010.11.02", time:"12:00:00", open:1.39888, high:1.40445, low:1.39864, close:1.40391, volume:17796 },
    { date:"2010.11.02", time:"16:00:00", open:1.40391, high:1.40607, low:1.40352, close:1.40419, volume:14012 },
    { date:"2010.11.02", time:"20:00:00", open:1.40411, high:1.40581, low:1.40271, close:1.40483, volume:12002 },
    { date:"2010.11.03", time:"00:00:00", open:1.40483, high:1.40661, low:1.40322, close:1.40508, volume:13248 },
    { date:"2010.11.03", time:"04:00:00", open:1.40524, high:1.40739, low:1.40345, close:1.40692, volume:12995 },
    { date:"2010.11.03", time:"08:00:00", open:1.40696, high:1.40775, low:1.40446, close:1.40516, volume:13937 },
    { date:"2010.11.03", time:"12:00:00", open:1.40524, high:1.40878, low:1.40350, close:1.40592, volume:17865 },
    { date:"2010.11.03", time:"16:00:00", open:1.40606, high:1.41605, low:1.40480, close:1.40721, volume:28496 },
    { date:"2010.11.03", time:"20:00:00", open:1.40722, high:1.40837, low:1.40345, close:1.40725, volume:15407 },
    { date:"2010.11.04", time:"00:00:00", open:1.40736, high:1.40843, low:1.40505, close:1.40639, volume:17629 },
    { date:"2010.11.04", time:"04:00:00", open:1.40639, high:1.40738, low:1.40381, close:1.40669, volume:13683 },
    { date:"2010.11.04", time:"08:00:00", open:1.40679, high:1.41076, low:1.40647, close:1.40805, volume:16518 },
    { date:"2010.11.04", time:"12:00:00", open:1.40800, high:1.40825, low:1.40181, close:1.40222, volume:18102 },
    { date:"2010.11.04", time:"16:00:00", open:1.40234, high:1.40251, low:1.39760, close:1.39789, volume:16207 },
    { date:"2010.11.04", time:"20:00:00", open:1.39792, high:1.40335, low:1.39725, close:1.40106, volume:13229 },
    { date:"2010.11.05", time:"00:00:00", open:1.40105, high:1.40239, low:1.39863, close:1.39870, volume:13123 },
    { date:"2010.11.05", time:"04:00:00", open:1.39866, high:1.40017, low:1.39593, close:1.39639, volume:15795 },
    { date:"2010.11.05", time:"08:00:00", open:1.39644, high:1.39958, low:1.39403, close:1.39495, volume:16342 },
    { date:"2010.11.05", time:"12:00:00", open:1.39500, high:1.39593, low:1.38251, close:1.38398, volume:20594 },
    { date:"2010.11.05", time:"16:00:00", open:1.38394, high:1.38641, low:1.38188, close:1.38241, volume:16069 },
    { date:"2010.11.05", time:"20:00:00", open:1.38239, high:1.38366, low:1.37913, close:1.38014, volume:3980 },

]

export const META = {
    pair:      'EURAUD',
    level:     'hard',
    timeframe: 'H4',
    period:    'Nov 2010'
}

export const CANDLES = convertRawToOHLCV(RAW_DATA)  