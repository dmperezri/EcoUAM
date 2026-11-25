import { useEffect, useState } from 'react'
import { CloudRain, Droplets, MapPin, Thermometer, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NaturePhoto } from '../../components/NaturePhoto'

const currentFields = ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m', 'wind_speed_10m'] as const
const dailyFields = ['temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max'] as const

const forecastUrl = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
  latitude: '12.13',
  longitude: '-86.25',
  timezone: 'America/Managua',
  temperature_unit: 'celsius',
  wind_speed_unit: 'kmh',
  current: currentFields.join(','),
  daily: dailyFields.join(','),
  forecast_days: '3',
})

type Forecast = {
  current: { time: string } & Record<(typeof currentFields)[number], number | null>
  daily: { time: string[] } & Record<(typeof dailyFields)[number], (number | null)[]>
}

type ForecastState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: Forecast }

const dateFormat = new Intl.DateTimeFormat('es-NI', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const numberFormat = new Intl.NumberFormat('es-NI', { maximumFractionDigits: 1 })
const localTimeFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const localDateFormat = /^\d{4}-\d{2}-\d{2}$/

function isForecast(value: unknown): value is Forecast {
  if (!value || typeof value !== 'object') return false
  const { current, daily } = value as Partial<Forecast>
  const validNumber = (number: unknown) => number === null || (typeof number === 'number' && Number.isFinite(number))
  return Boolean(current && typeof current.time === 'string' && localTimeFormat.test(current.time) &&
    currentFields.every((field) => validNumber(current[field])) &&
    typeof current.temperature_2m === 'number' &&
    daily && Array.isArray(daily.time) && daily.time.length > 0 &&
    daily.time.every((date) => typeof date === 'string' && localDateFormat.test(date) &&
      Number.isFinite(Date.parse(date))) &&
    dailyFields.every((field) => Array.isArray(daily[field]) &&
      daily[field].length === daily.time.length && daily[field].every(validNumber)))
}

function format(value: number | null, unit: string) {
  return value === null ? 'Sin datos' : numberFormat.format(value) + ' ' + unit
}

export function WeatherPage() {
  const [forecast, setForecast] = useState<ForecastState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const request = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => {
      request.abort()
      if (active) setForecast({ status: 'error' })
    }, 9000)

    async function load() {
      try {
        const response = await fetch(forecastUrl, { signal: request.signal })
        if (!response.ok) throw new Error('Pronóstico no disponible')
        const data: unknown = await response.json()
        if (!isForecast(data)) throw new Error('Respuesta incompleta')
        if (active && !request.signal.aborted) setForecast({ status: 'ready', data })
      } catch {
        if (active) setForecast({ status: 'error' })
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void load()
    return () => {
      active = false
      window.clearTimeout(timeout)
      request.abort()
    }
  }, [attempt])

  return (
    <div className="page-container nature-page nature-weather">
      <section className="nature-weather-hero" aria-labelledby="weather-title">
        <NaturePhoto photo="arboretum" />
        <div className="nature-hero-shade" />
        <div className="nature-weather-content">
          <p className="nature-location"><MapPin size={17} aria-hidden="true" /> Managua, Nicaragua</p>
          <h1 id="weather-title">Clima en la UAM</h1>
          <h2 className="nature-weather-subtitle">Pronóstico para Managua</h2>
          {forecast.status === 'loading' && <p className="nature-weather-status" role="status">Cargando pronóstico…</p>}
          {forecast.status === 'error' && (
            <div className="nature-weather-status">
              <p role="status">El pronóstico no está disponible por el momento.</p>
              <button type="button" className="nature-cta" onClick={() => {
                setForecast({ status: 'loading' })
                setAttempt((value) => value + 1)
              }}>Reintentar</button>
            </div>
          )}
          {forecast.status === 'ready' && <CurrentConditions data={forecast.data.current} />}
          <p className="nature-source"><a href="https://open-meteo.com/">Estimaciones meteorológicas de Open-Meteo</a></p>
        </div>
      </section>

      {forecast.status === 'ready' && <DailyForecast data={forecast.data.daily} />}
      <section className="nature-station nature-glass" aria-labelledby="station-title">
        <p className="nature-location"><Thermometer size={17} aria-hidden="true" /> Mediciones del campus</p>
        <h2 id="station-title">Estación meteorológica Copérnico</h2>
        <p>Consulta las mediciones del campus en el boletín oficial de la UAM.</p>
        <div className="nature-station-actions">
          <a className="nature-cta" href="https://www.uam.edu.ni/boletin-meteorologico-uam/">Consultar boletín oficial</a>
          <Link className="nature-cta nature-cta-secondary" to="/mapa?punto=estacion-meteorologica">Ubicar la estación en el mapa</Link>
        </div>
      </section>
    </div>
  )
}

function CurrentConditions({ data }: { data: Forecast['current'] }) {
  const [date, time] = data.time.split('T')
  const readings = [
    { label: 'Sensación térmica', value: format(data.apparent_temperature, '°C'), icon: Thermometer },
    { label: 'Humedad', value: format(data.relative_humidity_2m, '%'), icon: Droplets },
    { label: 'Viento', value: format(data.wind_speed_10m, 'km/h'), icon: Wind },
  ]

  return (
    <>
      <p className="nature-weather-time"><time dateTime={data.time}>{dateFormat.format(new Date(date))}, {time}</time> · hora de Managua</p>
      <p className="nature-temperature" aria-label={'Temperatura estimada: ' + format(data.temperature_2m, '°C')}>{format(data.temperature_2m, '°C')}</p>
      <dl className="nature-readings">
        {readings.map(({ label, value, icon: Icon }) => (
          <div key={label} className="nature-glass">
            <dt><Icon size={17} aria-hidden="true" /> {label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function DailyForecast({ data: daily }: { data: Forecast['daily'] }) {
  return (
    <section className="nature-forecast nature-glass" aria-labelledby="forecast-title">
      <h2 id="forecast-title">Pronóstico de tres días</h2>
      <ul>
        {daily.time.map((day, index) => (
          <li key={day}>
            <time dateTime={day}>{dateFormat.format(new Date(day))}</time>
            <p>Máx. {format(daily.temperature_2m_max[index], '°C')} · mín. {format(daily.temperature_2m_min[index], '°C')}</p>
            <p className="nature-rain"><CloudRain size={17} aria-hidden="true" /> Prob. de lluvia {format(daily.precipitation_probability_max[index], '%')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
