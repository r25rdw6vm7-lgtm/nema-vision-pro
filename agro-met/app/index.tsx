import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { assess } from '../core/agro-core';

const demo = assess({
  parcel: { id: 'PARSEL-001', crop: 'Bağ', phenology: 'Salkım gelişimi' },
  weather: { temperatureC: 27, humidityPct: 84, rain24hMm: 8, windKmh: 11, leafWetnessHours: 6, solarHours: 7 },
  soilMoisturePct: 38,
  cameraDiseaseSignal: 72,
  cameraPestSignal: 58,
  satelliteStressSignal: 41,
});

const risk = (n: number) => n >= 85 ? 'KRİTİK' : n >= 70 ? 'YÜKSEK' : n >= 50 ? 'ORTA' : 'DÜŞÜK';

export default function Home() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>AGRO-MET / COMMAND CENTER</Text><Text style={styles.title}>Tarımın erken uyarı ana merkezi</Text><Text style={styles.sub}>Parsel + meteoroloji + sensör + kamera + uydu sinyallerini tek karar katmanında birleştirir.</Text></View>
        <View style={styles.live}><View style={styles.dot}/><Text style={styles.liveText}>SİSTEM AKTİF</Text></View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroLeft}><Text style={styles.label}>GENEL PARSEL RİSKİ</Text><Text style={styles.score}>{demo.overallRisk}</Text><Text style={styles.level}>{demo.level}</Text><Text style={styles.muted}>Güven: %{demo.confidence}</Text></View>
        <View style={styles.heroRight}><Text style={styles.cardTitle}>PARSEL-001 · BAĞ</Text><Text style={styles.bigMessage}>{demo.overallRisk >= 70 ? 'Öncelikli saha kontrolü gerekiyor.' : 'Normal izleme rejimi yeterli.'}</Text><Text style={styles.muted}>Karar motoru, mevcut sinyalleri ağırlıklandırarak aksiyon sırası oluşturdu.</Text></View>
      </View>

      <View style={[styles.grid, wide && styles.gridWide]}>
        <Metric title="Hastalık" value={demo.diseaseRisk} />
        <Metric title="Zararlı" value={demo.pestRisk} />
        <Metric title="Su stresi" value={demo.waterStress} />
        <Metric title="Isı stresi" value={demo.heatStress} />
        <Metric title="Don" value={demo.frostRisk} />
        <Metric title="Güven" value={demo.confidence} suffix="%" />
      </View>

      <View style={[styles.columns, wide && styles.columnsWide]}>
        <View style={styles.panel}><Text style={styles.cardTitle}>RİSK FAKTÖRLERİ</Text>{demo.factors.map((f) => <View key={f.name} style={styles.factor}><View style={styles.factorTop}><Text style={styles.factorName}>{f.name}</Text><Text style={styles.factorScore}>{f.score}/100</Text></View><View style={styles.bar}><View style={[styles.fill, { width: `${f.score}%` }]}/></View><Text style={styles.factorReason}>{f.reason}</Text></View>)}</View>
        <View style={styles.panel}><Text style={styles.cardTitle}>ŞİMDİ NE YAPMALI?</Text>{demo.actions.map((a, i) => <View key={a} style={styles.action}><Text style={styles.actionNo}>{String(i + 1).padStart(2, '0')}</Text><Text style={styles.actionText}>{a}</Text></View>)}<View style={styles.forecast}><Text style={styles.cardTitle}>72 SAATLİK PENCERE</Text><Text style={styles.forecastText}>Risk yükselişi: 18–36 saat</Text><Text style={styles.muted}>Yeni sensör, kamera veya hava verisi geldiğinde değerlendirme yeniden hesaplanır.</Text></View></View>
      </View>

      <View style={styles.footer}><Text style={styles.footerText}>AGRO-MET CORE • deterministic + explainable • platform-neutral</Text><Text style={styles.footerText}>Web · Android · iOS · PWA</Text></View>
    </ScrollView>
  );
}

function Metric({ title, value, suffix = '' }: { title: string; value: number; suffix?: string }) {
  return <View style={styles.metric}><Text style={styles.metricTitle}>{title}</Text><Text style={styles.metricValue}>{value}{suffix}</Text><Text style={styles.metricRisk}>{risk(value)}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#07110d' },
  content: { width: '100%', maxWidth: 1280, alignSelf: 'center', padding: 24, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingVertical: 8 },
  eyebrow: { color: '#62d69a', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#f2f7f4', fontSize: 30, fontWeight: '800', marginTop: 8 },
  sub: { color: '#91a39a', fontSize: 14, lineHeight: 21, maxWidth: 700, marginTop: 8 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#214632', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#62d69a' }, liveText: { color: '#b8cfc1', fontSize: 11, fontWeight: '800' },
  hero: { flexDirection: 'row', backgroundColor: '#0d1d15', borderWidth: 1, borderColor: '#1e3b2b', borderRadius: 22, padding: 22, gap: 24 },
  heroLeft: { minWidth: 150 }, heroRight: { flex: 1, justifyContent: 'center' }, label: { color: '#7d9588', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }, score: { color: '#f2f7f4', fontSize: 64, fontWeight: '900', lineHeight: 70 }, level: { color: '#ffbd70', fontSize: 13, fontWeight: '900', letterSpacing: 1 }, cardTitle: { color: '#a8bbb0', fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }, bigMessage: { color: '#f2f7f4', fontSize: 22, fontWeight: '800', marginVertical: 9 }, muted: { color: '#7f9287', fontSize: 12, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, gridWide: { gap: 14 }, metric: { flexGrow: 1, flexBasis: '30%', minWidth: 150, backgroundColor: '#0b1812', borderColor: '#193126', borderWidth: 1, borderRadius: 16, padding: 16 }, metricTitle: { color: '#82968b', fontSize: 12, fontWeight: '700' }, metricValue: { color: '#edf5ef', fontSize: 30, fontWeight: '900', marginTop: 6 }, metricRisk: { color: '#62d69a', fontSize: 10, fontWeight: '900', marginTop: 2 },
  columns: { gap: 18 }, columnsWide: { flexDirection: 'row' }, panel: { flex: 1, backgroundColor: '#0b1812', borderWidth: 1, borderColor: '#193126', borderRadius: 18, padding: 18 }, factor: { marginTop: 18 }, factorTop: { flexDirection: 'row', justifyContent: 'space-between' }, factorName: { color: '#e6eee9', fontWeight: '800', fontSize: 13 }, factorScore: { color: '#8da296', fontSize: 12 }, bar: { height: 7, backgroundColor: '#16271f', borderRadius: 4, overflow: 'hidden', marginVertical: 7 }, fill: { height: 7, backgroundColor: '#62d69a', borderRadius: 4 }, factorReason: { color: '#788c81', fontSize: 11, lineHeight: 16 }, action: { flexDirection: 'row', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#16271f' }, actionNo: { color: '#62d69a', fontWeight: '900', fontSize: 12 }, actionText: { color: '#dbe7df', fontSize: 13, lineHeight: 19, flex: 1 }, forecast: { marginTop: 20, padding: 14, backgroundColor: '#0f2419', borderRadius: 14 }, forecastText: { color: '#f1f6f2', fontWeight: '800', fontSize: 16, marginVertical: 8 }, footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 4, paddingBottom: 24 }, footerText: { color: '#4f655a', fontSize: 10, fontWeight: '700' }
});
