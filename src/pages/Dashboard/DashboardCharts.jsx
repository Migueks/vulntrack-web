import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import styles from "./Dashboard.module.css";

const PRIORITY_COLORS = {
  P1: "#ef4444",
  P2: "#f97316",
  P3: "#eab308",
  P4: "#3b82f6",
};

const STATUS_COLORS = {
  OPEN: "#ef4444",
  IN_PROGRESS: "#f97316",
  MITIGATED: "#eab308",
  RESOLVED: "#22c55e",
  ACCEPTED_RISK: "#8b5cf6",
  FALSE_POSITIVE: "#64748b",
};

const TOOLTIP_STYLE = {
  background: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "0.625rem",
  color: "#f4f4f5",
  boxShadow: "0 10px 30px rgb(0 0 0 / 35%)",
};

function DashboardCharts({ overview }) {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const locale = i18n.resolvedLanguage === "en" ? "en-GB" : "es-ES";

  const formatNumber = (value) =>
    new Intl.NumberFormat(locale).format(value ?? 0);

  const formatMonth = (month) => {
    if (!month) {
      return "";
    }

    const [year, monthNumber] = month.split("-").map(Number);

    const date = new Date(Date.UTC(year, monthNumber - 1, 1));

    return new Intl.DateTimeFormat(locale, {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(date);
  };

  // Abre Findings aplicando directamente el filtro seleccionado.
  const openPriority = (priority) => {
    navigate(`/findings?priority=${encodeURIComponent(priority)}`);
  };

  const openStatus = (status) => {
    navigate(`/findings?status=${encodeURIComponent(status)}`);
  };

  const monthlyTrend = overview.monthlyTrend ?? [];

  const priorities = [...(overview.activeFindingsByPriority ?? [])].sort(
    (a, b) => a.priority.localeCompare(b.priority),
  );

  const statuses = (overview.findingsByStatus ?? []).map((item) => ({
    ...item,
    name: t(`findingStatus.${item.status}`),
    color: STATUS_COLORS[item.status] ?? "#71717a",
  }));

  const totalStatusFindings = statuses.reduce(
    (total, item) => total + item.count,
    0,
  );

  return (
    <section
      className={styles.chartsSection}
      aria-labelledby="dashboard-charts-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.sectionEyebrow}>{t("charts.eyebrow")}</span>

          <h2 id="dashboard-charts-title">{t("charts.title")}</h2>

          <p>{t("charts.description")}</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Evolución mensual */}

        <article className={`${styles.chartCard} ${styles.chartWide}`}>
          <div className={styles.chartHeading}>
            <h3>{t("charts.monthlyTrend")}</h3>

            <p>{t("charts.monthlyTrendDescription")}</p>
          </div>

          {monthlyTrend.length === 0 ? (
            <p className={styles.emptyChart}>{t("charts.noData")}</p>
          ) : (
            <>
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTrend}
                    margin={{
                      top: 10,
                      right: 15,
                      bottom: 5,
                      left: -20,
                    }}
                    accessibilityLayer
                  >
                    <CartesianGrid
                      stroke="#27272a"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      stroke="#71717a"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#71717a"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />

                    <Tooltip
                      cursor={{
                        stroke: "#3f3f46",
                      }}
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{
                        color: "#a1a1aa",
                      }}
                      itemStyle={{
                        color: "#f4f4f5",
                      }}
                      labelFormatter={formatMonth}
                      formatter={(value) => formatNumber(value)}
                    />

                    <Line
                      type="monotone"
                      dataKey="detected"
                      name={t("charts.detected")}
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="closed"
                      name={t("charts.closed")}
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.chartLegend}>
                <span>
                  <i className={styles.detectedDot} />

                  {t("charts.detected")}
                </span>

                <span>
                  <i className={styles.closedDot} />

                  {t("charts.closed")}
                </span>
              </div>
            </>
          )}
        </article>

        {/* Hallazgos activos por prioridad */}

        <article className={styles.chartCard}>
          <div className={styles.chartHeading}>
            <h3>{t("charts.priorities")}</h3>

            <p>{t("charts.prioritiesDescription")}</p>
          </div>

          {priorities.length === 0 ? (
            <p className={styles.emptyChart}>{t("charts.noData")}</p>
          ) : (
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorities}
                  margin={{
                    top: 10,
                    right: 15,
                    bottom: 5,
                    left: -20,
                  }}
                  accessibilityLayer
                >
                  <CartesianGrid
                    stroke="#27272a"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="priority"
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />

                  <Tooltip
                    cursor={{
                      fill: "transparent",
                    }}
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{
                      color: "#a1a1aa",
                    }}
                    itemStyle={{
                      color: "#f4f4f5",
                    }}
                    formatter={(value) => [
                      formatNumber(value),
                      t("charts.findings"),
                    ]}
                  />

                  <Bar
                    dataKey="count"
                    name={t("charts.findings")}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={55}
                  >
                    {priorities.map((item) => (
                      <Cell
                        key={item.priority}
                        fill={PRIORITY_COLORS[item.priority] ?? "#71717a"}
                        cursor="pointer"
                        onClick={() => openPriority(item.priority)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        {/* Hallazgos por estado */}

        <article className={styles.chartCard}>
          <div className={styles.chartHeading}>
            <h3>{t("charts.statuses")}</h3>

            <p>{t("charts.statusesDescription")}</p>
          </div>

          {totalStatusFindings === 0 ? (
            <p className={styles.emptyChart}>{t("charts.noData")}</p>
          ) : (
            <>
              <div className={styles.donutArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statuses}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="83%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statuses.map((item) => (
                        <Cell
                          key={item.status}
                          fill={item.color}
                          cursor="pointer"
                          onClick={() => openStatus(item.status)}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={{
                        color: "#a1a1aa",
                      }}
                      itemStyle={{
                        color: "#f4f4f5",
                      }}
                      formatter={(value) => formatNumber(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className={styles.donutCenter}>
                  <strong>{formatNumber(totalStatusFindings)}</strong>

                  <span>{t("charts.findings")}</span>
                </div>
              </div>

              <div className={styles.statusLegend}>
                {statuses.map((item) => (
                  <button
                    key={item.status}
                    type="button"
                    className={styles.statusItem}
                    onClick={() => openStatus(item.status)}
                  >
                    <span
                      className={styles.statusDot}
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span>{item.name}</span>

                    <strong>{formatNumber(item.count)}</strong>
                  </button>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}

export default DashboardCharts;
