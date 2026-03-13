<template>
  <div class="viewport">
    <div class="page" ref="pageRoot">
      <div class="cornerNav" :class="{ 'is-open': navOpen }" aria-label="导航">
        <button
          class="cornerToggle"
          type="button"
          @click="navOpen = !navOpen"
          :aria-expanded="navOpen ? 'true' : 'false'"
          :aria-label="navOpen ? '收起导航' : '展开导航'"
          :title="navOpen ? '收起' : '展开'"
        >
          <span class="cornerArrow" aria-hidden="true"></span>
        </button>
        <div v-if="navOpen" class="cornerMenu">
          <button class="cornerMenuItem" type="button" @click="openConfig">
            车辆配置
          </button>
          <button
            class="cornerMenuItem"
            type="button"
            @click="openPresentation"
          >
            全屏演示
          </button>
        </div>
      </div>
      <main class="mainGrid">
        <div class="stage">
          <div class="grid12">
            <section class="panel panel--quad panel--bare">
              <div class="miniQuad">
                <table class="miniTable">
                  <tbody>
                    <tr>
                      <td>今日总里程</td>
                      <td class="mono" :class="dayDeltaClass">
                        {{ formatKm(dayTotal, 1) }} km
                      </td>
                    </tr>
                    <tr>
                      <td>月总里程</td>
                      <td class="mono">{{ formatKm(monthTotal, 1) }} km</td>
                    </tr>
                  </tbody>
                </table>

                <div class="miniCard miniCard--stat">
                  <div class="miniValue miniValue--time mono">
                    <span>{{ lastSyncDateText }}</span>
                    <span>{{ lastSyncTimeText }}</span>
                  </div>
                </div>
              </div>

              <div class="quadBottom">
                <div class="panelHead">
                  <div class="pTitle">
                    公司里程<span class="pTitleSub">(TOP12)</span>
                  </div>
                  <button
                    v-if="companyMonthAll.length > 3"
                    class="contribMoreBtn"
                    type="button"
                    @click="showMoreContrib = !showMoreContrib"
                    :aria-expanded="showMoreContrib ? 'true' : 'false'"
                    aria-label="查看更多公司里程"
                  >
                    ···
                  </button>
                </div>
                <EChart
                  v-if="hasCompanyMonthData"
                  class="chart"
                  :option="companyMonthOption"
                  height="100%"
                />
                <ChartEmpty
                  v-else
                  title="公司贡献暂无数据"
                  desc="暂无可统计的公司贡献记录，稍后有数据会自动恢复。"
                />
                <div
                  v-if="showMoreContrib && companyMonthAll.length"
                  class="contribPopover"
                >
                  <div class="contribPopoverHead">更多公司贡献</div>
                  <ul class="contribList">
                    <li
                      v-for="(row, idx) in companyMonthAll"
                      :key="row.name"
                      class="contribItem"
                    >
                      <span class="contribRank">#{{ idx + 1 }}</span>
                      <span class="contribName" :title="row.name">{{
                        row.name
                      }}</span>
                      <span class="contribValue mono"
                        >{{ formatKm(row.km, 1) }} km</span
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div class="rowBottom">
              <section class="panel panel--perCar">
                <div class="panelHead">
                  <div class="pTitle">
                    当日车辆里程<span class="pTitleKm">km</span
                    ><span class="pTitleSub">(TOP10)</span>
                  </div>
                </div>
                <EChart
                  v-if="hasPerCarData"
                  class="chart"
                  :option="perCarOption"
                  height="100%"
                />
                <ChartEmpty
                  v-else
                  title="当日车辆里程暂无数据"
                  desc="当日没有可统计的车辆里程记录，稍后有数据会自动恢复。"
                />
              </section>

              <section class="panel panel--weekly">
                <div class="panelHead">
                  <div class="pTitle">
                    车辆每周总里程<span class="pTitleKm">km</span
                    ><span class="pTitleSub">(TOP10)</span>
                  </div>
                  <div class="pMeta">
                    {{ weekStart.slice(5).replace("-", "/") }} ~
                    {{ weekEnd.slice(5).replace("-", "/") }}
                  </div>
                </div>
                <EChart
                  v-if="hasWeeklyTrendData"
                  class="chart"
                  :option="weeklyTrendOption"
                  height="100%"
                />
                <ChartEmpty
                  v-else
                  title="车辆每周总里程暂无数据"
                  desc="本周没有可统计的车辆里程记录，稍后有数据会自动恢复。"
                />
              </section>

              <section class="panel panel--trend">
                <div class="panelHead">
                  <div class="pTitle">
                    近七天总里程趋势<span class="pTitleKm">km</span>
                  </div>
                </div>
                <EChart
                  class="chart"
                  :option="dailyTrendOption"
                  height="100%"
                />
              </section>
            </div>

            <section class="panel panel--dayCompany">
              <div class="panelHead">
                <div class="pTitle">日公司总里程占比</div>
              </div>
              <EChart
                v-if="hasCompanyPieData"
                class="chart"
                :option="companyPieOption"
                height="100%"
              />
              <ChartEmpty
                v-else
                title="日公司总里程占比暂无数据"
                desc="当前没有可统计的公司里程占比，稍后有数据会自动恢复。"
              />
            </section>

            <section class="panel panel--weekCompany">
              <div class="panelHead">
                <div class="pTitle">周公司总里程占比</div>
              </div>
              <EChart
                v-if="hasWeekCompanyPieData"
                class="chart"
                :option="weekCompanyPieOption"
                height="100%"
              />
              <ChartEmpty
                v-else
                title="周公司总里程占比暂无数据"
                desc="本周没有可统计的公司里程占比，稍后有数据会自动恢复。"
              />
            </section>

            <section class="panel panel--dayMap">
              <div class="panelHead">
                <div class="pTitle">日地图总里程占比</div>
              </div>
              <EChart
                v-if="hasMapPieData"
                class="chart"
                :option="mapPieOption"
                height="100%"
              />
              <ChartEmpty
                v-else
                title="日地图总里程占比暂无数据"
                desc="当前没有可统计的地图里程占比，稍后有数据会自动恢复。"
              />
            </section>

            <section class="panel panel--weekMap">
              <div class="panelHead">
                <div class="pTitle">周地图总里程占比</div>
              </div>
              <EChart
                v-if="hasWeekMapPieData"
                class="chart"
                :option="weekMapPieOption"
                height="100%"
              />
              <ChartEmpty
                v-else
                title="周地图总里程占比暂无数据"
                desc="本周没有可统计的地图里程占比，稍后有数据会自动恢复。"
              />
            </section>
          </div>
        </div>
      </main>

      <footer class="footer" v-if="error">
        <div class="muted">{{ error }}</div>
      </footer>

      <div v-if="configOpen" class="overlay" @click.self="closeConfig">
        <aside
          class="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="车辆配置"
        >
          <div class="drawerHead">
            <div class="drawerTitle">车辆配置</div>
            <button class="iconBtn" type="button" @click="closeConfig">
              关闭
            </button>
          </div>

          <div class="drawerTools">
            <div class="searchWrapper">
              <span class="searchIcon">🔍</span>
              <input
                v-model="carQuery"
                class="drawerInput"
                placeholder="搜索未指派车辆…"
              />
            </div>

            <select v-model="selectedType" class="typeSelect">
              <option value="all">全部类型</option>
              <option v-for="t in carTypes" :key="t" :value="t">{{ t }}</option>
            </select>

            <button
              class="ghostBtn"
              type="button"
              @click="showAssignedOnly = !showAssignedOnly"
            >
              {{ showAssignedOnly ? "查看未指派车辆" : "只看已指派车辆" }}
            </button>
          </div>

          <div v-if="!filteredCars.length" class="emptyState">
            <div class="emptyTitle">
              {{ showAssignedOnly ? "暂无已指派车辆" : "暂无未指派车辆" }}
            </div>
            <div class="emptyDesc">
              {{
                showAssignedOnly
                  ? "你可以切换为查看未指派车辆。"
                  : "你可以更改搜索条件。"
              }}
            </div>
          </div>
          <div v-else class="table">
            <div class="thead">
              <div>车辆</div>
              <div>当前负责人</div>
              <div>指派</div>
            </div>

            <div class="tbody">
              <div v-for="c in filteredCars" :key="c.vin" class="trow">
                <div class="carCell" data-label="车辆">
                  <div class="carName">{{ c.car_name || "未知车辆" }}</div>
                  <div class="carMeta muted">{{ c.type || "" }}</div>
                </div>
                <div class="ownerCell" data-label="当前负责人">
                  <span v-if="c.worker_name" class="pill">{{
                    c.worker_name
                  }}</span>
                  <span v-else class="pill pill--empty">未指派</span>
                </div>
                <div class="assignCell" data-label="指派">
                  <select
                    v-model="workerPick[c.vin]"
                    class="select"
                    :title="workerPick[c.vin] || ''"
                  >
                    <option value="">选择人员</option>
                    <option v-for="w in workers" :key="w.id" :value="w.name">
                      {{ w.name }}
                    </option>
                  </select>
                  <div class="assignBtns">
                    <button
                      class="smallBtn"
                      type="button"
                      :disabled="assigningVin === c.vin || !workerPick[c.vin]"
                      @click="doAssign(c.vin)"
                    >
                      {{ assigningVin === c.vin ? "指派中" : "指派" }}
                    </button>
                    <button
                      v-if="c.worker_name"
                      class="smallBtn smallBtn--danger"
                      type="button"
                      :disabled="assigningVin === c.vin"
                      @click="doUnassign(c.vin)"
                    >
                      {{ assigningVin === c.vin ? "处理中" : "取消指派" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="drawerFoot">
            <div class="muted">{{ configStatus }}</div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import EChart from "./components/EChart.vue";
import ChartEmpty from "./components/ChartEmpty.vue";
import { assignWorker, getCars, getStats, getWorkers } from "./lib/api";
import {
  formatKm,
  groupSum,
  monthKey,
  num,
  parseDayFromIso,
  startOfWeekYMD,
  sumBy,
  toYMD,
  withinMonth,
  withinWeek,
  ymdToDate,
} from "./lib/metrics";

const today = toYMD(new Date());
const pageRoot = ref(null);
const selectedDay = ref(today);

const error = ref("");

const serverDay = ref("");
const rangesRaw = ref([]);
const mapStatsRaw = ref([]);
const weekMapStatsRaw = ref([]);
const companyStatsRaw = ref([]);
const companyMonthStatsRaw = ref([]);
const vinMapRaw = ref({});
const carNameByVin = ref(new Map());

const configOpen = ref(false);
const carsList = ref([]);
const workers = ref([]);
const carQuery = ref("");
const selectedType = ref("all");
const showAssignedOnly = ref(false);
const workerPick = ref({});
const assigningVin = ref("");
const configStatus = ref("");

const navOpen = ref(false);

let wasFullscreen = false;

const selectedMonth = computed(() => monthKey(selectedDay.value));
const weekStart = computed(() => startOfWeekYMD(selectedDay.value));
const weekEnd = computed(() => {
  const s = ymdToDate(weekStart.value);
  if (!s) return "";
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return toYMD(e);
});

const ranges = computed(() =>
  (rangesRaw.value || [])
    .map((r) => ({
      vin: r.vin || "-",
      day: parseDayFromIso(r.time),
      km: num(r.car_day_range),
      syncAt: r.sync_at ? new Date(r.sync_at).getTime() : 0,
    }))
    .filter((r) => !!r.day),
);

function formatDateTimeToMinute(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

const lastSyncText = computed(() => {
  const max = Math.max(0, ...ranges.value.map((r) => r.syncAt || 0));
  if (!max) return "-";
  return formatDateTimeToMinute(max);
});

const lastSyncDateText = computed(() => {
  if (!lastSyncText.value || lastSyncText.value === "-") return "-";
  return lastSyncText.value.split(" ")[0] || "-";
});

const lastSyncTimeText = computed(() => {
  if (!lastSyncText.value || lastSyncText.value === "-") return "";
  return lastSyncText.value.split(" ")[1] || "";
});

const dayRanges = computed(() =>
  ranges.value.filter((r) => r.day === selectedDay.value),
);
const dayTotal = computed(() => sumBy(dayRanges.value, (r) => r.km));

const yesterdayYmd = computed(() => {
  const d = ymdToDate(selectedDay.value) || new Date();
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return toYMD(y);
});

const monthTotal = computed(() =>
  sumBy(
    ranges.value.filter((r) => withinMonth(r.day, selectedMonth.value)),
    (r) => r.km,
  ),
);

const vinToMapDisplay = computed(() => {
  const raw = vinMapRaw.value || {};
  const m = new Map();
  for (const [vin, map] of Object.entries(raw)) {
    if (!vin) continue;
    const display = normalizeMapName(map);
    if (display) m.set(vin, display);
  }
  return m;
});

const weekTotal = computed(() =>
  sumBy(
    ranges.value.filter((r) => withinWeek(r.day, weekStart.value)),
    (r) => r.km,
  ),
);

const totalsByDay = computed(() => {
  const m = new Map();
  for (const r of ranges.value) m.set(r.day, (m.get(r.day) || 0) + r.km);
  return m;
});

const yesterdayTotal = computed(
  () => totalsByDay.value.get(yesterdayYmd.value) || 0,
);
const dayDeltaClass = computed(() => {
  const a = dayTotal.value;
  const b = yesterdayTotal.value;
  if (a > b) return "pos";
  if (a < b) return "neg";
  return "";
});

const perCarBars = computed(() => {
  const m = groupSum(
    dayRanges.value,
    (r) => r.vin,
    (r) => r.km,
  );
  return Array.from(m.entries())
    .map(([vin, km]) => ({ vin, km, name: carNameByVin.value.get(vin) || "" }))
    .sort((a, b) => b.km - a.km);
});

const hasPerCarData = computed(() =>
  (perCarBars.value || []).some((x) => num(x?.km) > 0),
);

const hasMapPieData = computed(() => {
  const total = sumBy(mapStatsRaw.value || [], (x) => num(x?.total));
  return total > 0;
});

const hasWeekMapPieData = computed(() => {
  const total = sumBy(weekMapStatsRaw.value || [], (x) => num(x?.total));
  return total > 0;
});

const hasCompanyPieData = computed(() => {
  const total = sumBy(companyStatsRaw.value || [], (x) => num(x?.total));
  return total > 0;
});

const hasWeekCompanyPieData = computed(() => {
  const total = sumBy(weekMapStatsRaw.value || [], (x) => num(x?.total));
  return total > 0;
});

const hasWeeklyTrendData = computed(() => {
  const total = sumBy(
    ranges.value.filter((r) => withinWeek(r.day, weekStart.value)),
    (r) => r.km,
  );
  return total > 0;
});

const companyMonthAll = computed(() => {
  const m = new Map();
  for (const row of companyMonthStatsRaw.value || []) {
    const name = (row?.company_name || "").trim() || "未知公司";
    const total = num(row?.total);
    if (total <= 0) continue;
    m.set(name, (m.get(name) || 0) + total);
  }
  return Array.from(m.entries())
    .map(([name, km]) => ({ name, km }))
    .sort((a, b) => b.km - a.km);
});

const hasCompanyMonthData = computed(() =>
  (companyMonthAll.value || []).some((x) => num(x?.km) > 0),
);

const isFullscreen = ref(!!document.fullscreenElement);

function tooltipCardBase() {
  return {
    confine: true,
    appendToBody: !isFullscreen.value,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "rgba(148,163,184,0.42)",
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: "#111827", fontSize: 12 },
    extraCssText:
      "border-radius: 12px; box-shadow: 0 18px 48px rgba(15,23,42,.18); backdrop-filter: blur(10px);",
  };
}

const perCarOption = computed(() => {
  const top = perCarBars.value.slice(0, 10);
  const nameCounts = new Map();
  const labels = top.map((row) => {
    const base = (row.name || "").trim() || "未知车辆";
    const n = (nameCounts.get(base) || 0) + 1;
    nameCounts.set(base, n);
    const carName = n === 1 ? base : `${base} ${n}`;
    const mapName = vinToMapDisplay.value.get(row.vin);
    return mapName ? `${carName}（${mapName}）` : carName;
  });

  const y = top.map((x) => Number(x.km.toFixed(2)));
  return {
    grid: { left: 18, right: 18, top: 18, bottom: 18, containLabel: true },
    tooltip: {
      trigger: "item",
      ...tooltipCardBase(),
      formatter: (p) => {
        const idx = p?.dataIndex ?? 0;
        const row = top[idx];
        if (!row) return "";
        const title = (labels[idx] || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `${title}<br/>里程：<b>${formatKm(row.km, 2)}</b> km`;
      },
    },
    xAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: "rgba(209,213,219,.9)" } },
    },
    yAxis: {
      type: "category",
      data: labels,
      inverse: true,
      axisLabel: {
        color: "rgba(55,65,81,.9)",
        fontSize: 12,
        width: 220,
        overflow: "truncate",
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(148,163,184,.6)" } },
    },
    series: [
      {
        type: "bar",
        data: y,
        barWidth: 10,
        label: {
          show: true,
          position: "right",
          distance: 8,
          color: "#111827",
          fontSize: 12,
          fontWeight: 650,
          formatter: (p) => `${formatKm(p.value, 1)}`,
        },
        itemStyle: {
          borderRadius: [10, 10, 6, 6],
          color: makeBarGradient(),
        },
      },
    ],
  };
});

const mapPieOption = computed(() => {
  const m = new Map();
  for (const x of mapStatsRaw.value || []) {
    const raw = (x?.map || "未知").trim() || "未知";
    const display = normalizeMapName(raw);
    m.set(display, (m.get(display) || 0) + num(x?.total));
  }
  const rows = Array.from(m.entries()).map(([name, value]) => ({
    name,
    value,
  }));
  rows.sort((a, b) => (num(b.value) || 0) - (num(a.value) || 0));
  return {
    tooltip: {
      trigger: "item",
      ...tooltipCardBase(),
      formatter: (p) =>
        `${(p?.name || "-").replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br/>总里程：<b>${formatKm(
          p?.value ?? 0,
          2,
        )}</b> km<br/>占比：<b>${Math.round(p?.percent ?? 0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "70%"],
        center: ["50%", "50%"],
        clockwise: true,
        avoidLabelOverlap: true,
        minShowLabelAngle: 6,
        label: {
          color: "#111827",
          fontSize: 12,
          formatter: (p) => `${p.name}`,
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: { color: "rgba(148,163,184,.9)" },
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: rows,
      },
    ],
  };
});

const companyPieOption = computed(() => {
  const m = new Map();
  for (const x of companyStatsRaw.value || []) {
    const name = (x?.company_name || "").trim() || "未知公司";
    m.set(name, (m.get(name) || 0) + num(x?.total));
  }
  const rows = Array.from(m.entries()).map(([name, value]) => ({
    name,
    value,
  }));
  rows.sort((a, b) => (num(b.value) || 0) - (num(a.value) || 0));
  return {
    tooltip: {
      trigger: "item",
      ...tooltipCardBase(),
      formatter: (p) =>
        `${(p?.name || "-").replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br/>总里程：<b>${formatKm(
          p?.value ?? 0,
          2,
        )}</b> km<br/>占比：<b>${Math.round(p?.percent ?? 0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "70%"],
        center: ["50%", "50%"],
        clockwise: true,
        avoidLabelOverlap: true,
        minShowLabelAngle: 6,
        label: {
          color: "#111827",
          fontSize: 12,
          formatter: (p) => `${p.name}`,
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: { color: "rgba(148,163,184,.9)" },
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: rows,
      },
    ],
  };
});

const weekMapPieOption = computed(() => {
  const m = new Map();
  for (const x of weekMapStatsRaw.value || []) {
    const raw = (x?.map || "未知").trim() || "未知";
    const display = normalizeMapName(raw);
    m.set(display, (m.get(display) || 0) + num(x?.total));
  }
  const rows = Array.from(m.entries()).map(([name, value]) => ({
    name,
    value,
  }));
  rows.sort((a, b) => (num(b.value) || 0) - (num(a.value) || 0));
  return {
    tooltip: {
      trigger: "item",
      ...tooltipCardBase(),
      formatter: (p) =>
        `${(p?.name || "-").replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br/>总里程：<b>${formatKm(
          p?.value ?? 0,
          2,
        )}</b> km<br/>占比：<b>${Math.round(p?.percent ?? 0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "70%"],
        center: ["50%", "50%"],
        clockwise: true,
        avoidLabelOverlap: true,
        minShowLabelAngle: 6,
        label: {
          color: "#111827",
          fontSize: 12,
          formatter: (p) => `${p.name}`,
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: { color: "rgba(148,163,184,.9)" },
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: rows,
      },
    ],
  };
});

const weekCompanyPieOption = computed(() => {
  const m = new Map();
  for (const x of weekMapStatsRaw.value || []) {
    const name = (x?.company_name || "").trim() || "未知公司";
    m.set(name, (m.get(name) || 0) + num(x?.total));
  }
  const rows = Array.from(m.entries()).map(([name, value]) => ({
    name,
    value,
  }));
  rows.sort((a, b) => (num(b.value) || 0) - (num(a.value) || 0));
  return {
    tooltip: {
      trigger: "item",
      ...tooltipCardBase(),
      formatter: (p) =>
        `${(p?.name || "-").replace(/</g, "&lt;").replace(/>/g, "&gt;")}<br/>总里程：<b>${formatKm(
          p?.value ?? 0,
          2,
        )}</b> km<br/>占比：<b>${Math.round(p?.percent ?? 0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "70%"],
        center: ["50%", "50%"],
        clockwise: true,
        avoidLabelOverlap: true,
        minShowLabelAngle: 6,
        label: {
          color: "#111827",
          fontSize: 12,
          formatter: (p) => `${p.name}`,
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: { color: "rgba(148,163,184,.9)" },
        },
        itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
        data: rows,
      },
    ],
  };
});

const dailyTrendOption = computed(() => {
  const end = ymdToDate(selectedDay.value) || new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const ymd = toYMD(d);
    days.push(ymd);
  }
  const y = days.map((d) => Number((totalsByDay.value.get(d) || 0).toFixed(2)));
  return {
    grid: { left: 56, right: 18, top: 24, bottom: 52 },
    tooltip: {
      trigger: "axis",
      textStyle: { color: "#111827", fontSize: 12 },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: days.map((d) => d.slice(5).replace("-", "/")),
      axisTick: { show: true, alignWithLabel: true },
      axisLabel: {
        color: "#374151",
        fontSize: 11,
        align: "center",
        interval: 0,
      },
      axisLine: { lineStyle: { color: "rgba(148,163,184,.6)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: "rgba(209,213,219,.9)" } },
    },
    series: [
      {
        type: "line",
        data: y,
        smooth: false,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 3, color: "#0f766e" },
        itemStyle: { color: "#0f766e", borderWidth: 2 },
        label: {
          show: true,
          position: "top",
          distance: 6,
          color: "#111827",
          fontSize: 12,
          fontWeight: 650,
          formatter: (p) => `${formatKm(p.value, 1)}`,
        },
      },
    ],
  };
});

const weeklyTrendOption = computed(() => {
  const weeklyRanges = ranges.value.filter((r) =>
    withinWeek(r.day, weekStart.value),
  );

  const m = groupSum(
    weeklyRanges,
    (r) => r.vin,
    (r) => r.km,
  );

  const top = Array.from(m.entries())
    .map(([vin, km]) => ({
      vin,
      km,
      name: carNameByVin.value.get(vin) || "",
    }))
    .filter((row) => row.km > 0)
    .sort((a, b) => b.km - a.km)
    .slice(0, 10);

  const nameCounts = new Map();
  const labels = top.map((row) => {
    const base = (row.name || "").trim() || "未知车辆";
    const n = (nameCounts.get(base) || 0) + 1;
    nameCounts.set(base, n);
    return n === 1 ? base : `${base} ${n}`;
  });

  const y = top.map((x) => Number(x.km.toFixed(2)));

  return {
    grid: { left: 56, right: 18, top: 24, bottom: 80 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      textStyle: { color: "#111827", fontSize: 12 },
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const idx = p?.dataIndex ?? 0;
        const row = top[idx];
        if (!row) return "";
        const title = (labels[idx] || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const mapName = vinToMapDisplay.value.get(row.vin);
        const mapLine = mapName ? `<br/>地图：<b>${mapName}</b>` : "";
        return `${title}${mapLine}<br/>本周总里程：<b>${formatKm(row.km, 2)}</b> km`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        color: "#374151",
        fontSize: 11,
        interval: 0,
        rotate: 26,
      },
      axisLine: { lineStyle: { color: "rgba(148,163,184,.6)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: "rgba(209,213,219,.9)" } },
    },
    series: [
      {
        type: "bar",
        data: y,
        barWidth: 10,
        itemStyle: {
          borderRadius: [10, 10, 6, 6],
          color: makeBarGradient2(),
        },
        label: {
          show: true,
          position: "top",
          distance: 6,
          color: "#111827",
          fontSize: 12,
          fontWeight: 650,
          formatter: (p) => `${formatKm(p.value, 1)}`,
        },
      },
    ],
  };
});

const showMoreContrib = ref(false);

const companyMonthOption = computed(() => {
  const ordered = (companyMonthAll.value || []).slice(0, 12);
  const yLabels = ordered.map((r) => r.name);
  const xValues = ordered.map((r) => Number(r.km.toFixed(2)));
  const data = xValues.map((v) => ({
    value: v,
    itemStyle: {
      color: makeBarGradient3(),
      borderRadius: [8, 12, 12, 8],
      shadowBlur: 10,
      shadowColor: "rgba(15,23,42,0.14)",
      shadowOffsetX: 5,
    },
  }));

  return {
    grid: { left: 18, right: 18, top: 10, bottom: 12, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipCardBase(),
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const name = (p?.name || "-")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const v = p?.value ?? 0;
        return `${name}<br/>里程：<b>${formatKm(v, 2)}</b> km`;
      },
    },
    xAxis: {
      type: "value",
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: yLabels,
      inverse: true,
      axisLabel: {
        color: "rgba(55,65,81,.92)",
        fontSize: 11,
        width: 120,
        overflow: "truncate",
        margin: 10,
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(148,163,184,.6)" } },
      splitLine: { show: false },
    },
    series: [
      {
        type: "bar",
        data,
        barWidth: 10,
        emphasis: { focus: "series" },
        label: {
          show: true,
          position: "right",
          distance: 6,
          color: "#111827",
          fontSize: 12,
          fontWeight: 700,
          formatter: (p) => formatKm(p.value, 1),
        },
      },
    ],
  };
});

const filteredCars = computed(() => {
  const q = (carQuery.value || "").trim().toLowerCase();
  let list = (carsList.value || []).filter((c) =>
    showAssignedOnly.value ? !!c.worker_name : !c.worker_name,
  );

  if (selectedType.value !== "all") {
    list = list.filter((c) => (c.type || "") === selectedType.value);
  }

  if (!q) return list;
  return list.filter((c) =>
    `${c.car_name || ""} ${c.type || ""}`.toLowerCase().includes(q),
  );
});

const carTypes = computed(() => {
  const set = new Set();
  for (const c of carsList.value || []) {
    if (!c.type) continue;
    set.add(c.type);
  }
  return Array.from(set).sort();
});

async function refresh() {
  return refreshImpl({ silent: false });
}

async function refreshSilent() {
  return refreshImpl({ silent: true });
}

async function refreshImpl({ silent }) {
  if (!silent) {
    error.value = "";
  }
  try {
    const data = await getStats();
    serverDay.value = data?.day || "";
    rangesRaw.value = data?.ranges || [];
    mapStatsRaw.value = data?.map_stats || [];
    weekMapStatsRaw.value = data?.week_map_stats || [];
    companyStatsRaw.value = data?.company_stats || [];
    companyMonthStatsRaw.value = data?.company_month_stats || [];
    vinMapRaw.value = data?.vin_map || {};
  } catch (e) {
    if (!silent) error.value = e?.message || "无法获取 /api/stats";
  } finally {
    // 静默完成
  }
}

let pollTimer = null;
let onFsChange = null;

async function buildCarNameMapFromCars(cars) {
  const m = new Map();
  for (const c of cars || []) {
    if (!c?.vin) continue;
    const name = c?.car_name || c?.name || "";
    if (name) m.set(c.vin, name);
  }
  carNameByVin.value = m;
}

async function loadConfigData() {
  configStatus.value = "";
  try {
    const [cars, ws] = await Promise.all([getCars(), getWorkers()]);
    carsList.value = Array.isArray(cars) ? cars : [];
    workers.value = Array.isArray(ws) ? ws : [];
    workerPick.value = {};
    await buildCarNameMapFromCars(carsList.value);
    configStatus.value = `已加载：${carsList.value.length} 辆车 / ${workers.value.length} 人`;
  } catch (e) {
    configStatus.value = e?.message || "加载失败";
  }
}

function openConfig() {
  configOpen.value = true;
  if (!carsList.value.length || !workers.value.length) loadConfigData();
}

function closeConfig() {
  configOpen.value = false;
}

async function openPresentation() {
  const el = pageRoot.value || document.documentElement;
  if (!el) return;
  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      isFullscreen.value = true;
    } else {
      await document.exitFullscreen();
      window.location.reload();
    }
  } catch {
    // 全屏失败静默忽略
  }
}

async function doAssign(vin) {
  const pick = workerPick.value?.[vin];
  if (!vin || !pick) return;
  assigningVin.value = vin;
  configStatus.value = "";
  try {
    await assignWorker({ vin, worker_name: pick });
    configStatus.value = "指派成功";
    await loadConfigData();
    refreshSilent();
  } catch (e) {
    configStatus.value = e?.message || "指派失败";
  } finally {
    assigningVin.value = "";
  }
}

async function doUnassign(vin) {
  if (!vin) return;
  assigningVin.value = vin;
  configStatus.value = "";
  try {
    await assignWorker({ vin, worker_name: "" });
    if (workerPick.value) workerPick.value[vin] = "";
    configStatus.value = "已取消指派";
    await loadConfigData();
    refreshSilent();
  } catch (e) {
    configStatus.value = e?.message || "取消指派失败";
  } finally {
    assigningVin.value = "";
  }
}

onMounted(async () => {
  wasFullscreen = !!document.fullscreenElement;
  onFsChange = () => {
    const now = !!document.fullscreenElement;
    isFullscreen.value = now;
    if (wasFullscreen && !now) window.location.reload();
    wasFullscreen = now;
  };
  document.addEventListener("fullscreenchange", onFsChange);

  try {
    const cars = await getCars();
    await buildCarNameMapFromCars(cars);
  } catch {
    carNameByVin.value = new Map();
  }

  await refresh();

  pollTimer = setInterval(() => {
    refreshSilent();
  }, 20000);
});

onBeforeUnmount(() => {
  if (onFsChange) document.removeEventListener("fullscreenchange", onFsChange);
  onFsChange = null;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
});

function makeBarGradient() {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(130,220,255,1)" },
      { offset: 1, color: "rgba(40,110,255,1)" },
    ],
  };
}

function makeBarGradient2() {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(165,210,255,1)" },
      { offset: 1, color: "rgba(56,130,220,1)" },
    ],
  };
}

function makeBarGradient3() {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: "rgba(160,255,214,1)" },
      { offset: 1, color: "rgba(40,180,130,1)" },
    ],
  };
}

function normalizeMapName(raw) {
  const base = (raw || "").trim();
  if (!base) return "未知";
  const idx = base.search(/[0_-]/);
  if (idx === -1) return base;
  const cut = base.slice(0, idx).trim();
  return cut || "未知";
}
</script>

<style scoped>
:global(html, body, #app) {
  height: 100%;
  width: 100%;
  margin: 0;
}
:global(*),
:global(*::before),
:global(*::after) {
  box-sizing: border-box;
}

:global(:root) {
  --bg-0: #eef1f5;
  --bg-1: rgba(255, 255, 255, 0.86);
  --panel: rgba(255, 255, 255, 0.3);
  --panel-border: rgba(148, 163, 184, 0.16);
  --text-0: rgba(17, 24, 39, 0.92);
  --text-1: rgba(55, 65, 81, 0.88);
  --muted: rgba(107, 114, 128, 0.92);
  --shadow-0: 0 26px 70px rgba(15, 23, 42, 0.14);
  --shadow-1: 0 10px 26px rgba(15, 23, 42, 0.06);
  --ring: 0 0 0 2px rgba(80, 150, 255, 0.26);
  --r-lg: 16px;
  --r-md: 12px;
  --gap: clamp(8px, 1.1vh, 12px);
  --pad: clamp(10px, 1.2vh, 14px);
}

.cornerNav {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  z-index: 60;
}
.cornerToggle {
  width: 24px;
  height: 42px;
  border-radius: 0 999px 999px 0;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-left: none;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
  color: #111827;
  display: grid;
  place-items: center;
  cursor: pointer;
  touch-action: none;
  box-shadow:
    0 12px 34px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  transition:
    background-color 0.14s ease,
    border-color 0.14s ease,
    box-shadow 0.14s ease,
    opacity 0.14s ease;
}
.cornerNav:not(.is-open) .cornerToggle {
  opacity: 0.55;
  background: rgba(255, 255, 255, 0.68);
  border-color: rgba(148, 163, 184, 0.22);
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}
.cornerToggle:hover {
  opacity: 1;
  border-color: rgba(59, 130, 246, 0.55);
  background: rgba(238, 242, 255, 0.92);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.cornerToggle:active {
  background: rgba(238, 242, 255, 0.98);
}
.cornerToggle:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(10, 132, 255, 0.26),
    0 16px 40px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.cornerArrow {
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(17, 24, 39, 0.85);
  border-bottom: 2px solid rgba(17, 24, 39, 0.85);
  transform: rotate(-45deg);
  transition: transform 0.16s ease;
}
.cornerNav:not(.is-open) .cornerArrow {
  border-right-color: rgba(17, 24, 39, 0.55);
  border-bottom-color: rgba(17, 24, 39, 0.55);
}
.cornerNav.is-open .cornerArrow {
  transform: rotate(135deg);
}
.cornerMenu {
  margin-left: 10px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 14px 38px rgba(15, 23, 42, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform-origin: left center;
  animation: navPop 0.14s ease-out;
}
.cornerNav.is-open .cornerToggle {
  background: rgba(255, 255, 255, 0.94);
}
.cornerMenuItem {
  min-width: 120px;
  padding: 6px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 12px;
  color: #111827;
  cursor: pointer;
}
.cornerMenuItem:hover {
  background: #eef2ff;
  color: #1d4ed8;
}

@keyframes navPop {
  from {
    opacity: 0;
    transform: translateX(-6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: block;
}

.page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  transform-origin: top left;
  padding: 0;
  color: var(--text-0);
  font-family:
    "MiSans",
    "HarmonyOS Sans SC",
    "Microsoft YaHei UI",
    "Microsoft YaHei",
    "PingFang SC",
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background:
    radial-gradient(
      circle at top left,
      rgba(191, 219, 254, 0.5),
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(187, 247, 208, 0.4),
      transparent 55%
    ),
    linear-gradient(135deg, #f5f6f8, var(--bg-0));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mainGrid {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.grid12 {
  display: grid;
  grid-template-columns: minmax(0, 35fr) minmax(0, 35fr) minmax(0, 30fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--gap);
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  align-content: stretch;
  align-items: stretch;
}

.stage {
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  margin-top: 0;
  padding: var(--pad);
  border-radius: 0;
  background: var(--bg-1);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow:
    var(--shadow-0),
    0 0 0 1px rgba(255, 255, 255, 0.7);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel {
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  box-shadow:
    var(--shadow-1),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  padding: 8px 10px 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel--bare {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  overflow: visible;
}
.panel--bare::before {
  display: none;
}

.miniQuad {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(0, auto);
  gap: 8px;
  flex: 0 0 auto;
  min-height: 0;
}

.miniCard {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 14px 34px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  padding: 8px 10px;
  min-width: 0;
  height: clamp(96px, 12vh, 128px);
}
.miniQuad .miniCard {
  height: auto;
}
.miniCard--stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
}
.miniCard--stat:first-child .miniValueRow {
  margin-top: -4px;
}
.miniCard--stat:first-child .miniValueRow .miniValue {
  font-size: clamp(20px, 2.1vw, 26px);
  font-weight: 860;
}
.miniLabel {
  font-size: 11px;
  color: rgba(107, 114, 128, 0.92);
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.miniValueRow {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  width: 100%;
}
.miniUnit {
  font-size: 12px;
  font-weight: 750;
  color: rgba(107, 114, 128, 0.92);
  letter-spacing: 0.02em;
}

.miniValueRow.pos .miniValue {
  color: #15803d;
}
.miniValueRow.neg .miniValue {
  color: #b91c1c;
}
.miniValue {
  font-size: clamp(15px, 1.6vw, 18px);
  font-weight: 820;
  color: var(--text-0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.miniValue--time {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 820;
  color: rgba(17, 24, 39, 0.98);
  line-height: 1.2;
  gap: 6px;
  white-space: nowrap;
}
.miniMeta {
  font-size: 11px;
  font-weight: 750;
  color: rgba(107, 114, 128, 0.92);
  letter-spacing: 0.01em;
  text-align: center;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0)),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0px,
      rgba(255, 255, 255, 0.05) 1px,
      rgba(255, 255, 255, 0) 1px,
      rgba(255, 255, 255, 0) 22px
    );
  opacity: 0.25;
  pointer-events: none;
}

.panel > * {
  position: relative;
}

.chart {
  flex: 1 1 auto;
  min-height: 0;
}

.panelHead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.pTitle {
  font-weight: 760;
  letter-spacing: 0.02em;
  font-size: clamp(13px, 1.2vw, 14px);
  color: var(--text-0);
}
.pTitleSub {
  margin-left: 6px;
  font-weight: 720;
  letter-spacing: 0.01em;
  font-size: 12px;
  color: rgba(107, 114, 128, 0.92);
}
.pTitleKm {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(107, 114, 128, 0.8);
}
.pMeta {
  font-size: 12px;
  color: rgba(107, 114, 128, 0.92);
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.contribMoreBtn {
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  padding: 0 6px 2px;
  height: 18px;
  font-size: 13px;
  line-height: 1;
  color: rgba(55, 65, 81, 0.9);
  cursor: pointer;
  box-shadow:
    0 2px 6px rgba(15, 23, 42, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.contribMoreBtn:hover {
  background: rgba(255, 255, 255, 0.98);
}

.contribPopover {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 6px;
  z-index: 10;
  min-width: 220px;
  max-width: 260px;
  max-height: 220px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.4);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.contribPopoverHead {
  font-size: 12px;
  font-weight: 700;
  color: rgba(17, 24, 39, 0.9);
}
.contribList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: auto;
}
.contribItem {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: rgba(55, 65, 81, 0.92);
}
.contribRank {
  color: rgba(148, 163, 184, 0.95);
}
.contribName {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.contribValue {
  font-weight: 700;
  color: rgba(15, 23, 42, 0.98);
}

@media (max-height: 820px) {
  .grid12 {
    gap: 8px;
  }
  .stage {
    padding: 10px;
  }
  .panel {
    padding: 8px 8px 6px;
  }
  .miniCard {
    height: clamp(104px, 13vh, 128px);
  }
}

@media (max-width: 1280px) {
  .grid12 {
    grid-template-columns: minmax(0, 35fr) minmax(0, 35fr) minmax(0, 30fr);
  }
  .pTitle {
    letter-spacing: 0.01em;
  }
}

.grid12 > .panel--quad {
  grid-column: 3 / 4;
  grid-row: 1 / 3;
}
.grid12 > .panel--dayCompany {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}
.grid12 > .panel--weekCompany {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}
.grid12 > .panel--dayMap {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}
.grid12 > .panel--weekMap {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.rowBottom {
  grid-column: 1 / 4;
  grid-row: 3 / 4;
  display: grid;
  grid-template-columns: minmax(0, 35fr) minmax(0, 35fr) minmax(0, 30fr);
  gap: var(--gap);
  min-height: 0;
}

.panel--quad {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: visible;
}
.quadBottom {
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(148, 163, 184, 0.14);
  padding: 10px 10px 8px;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(248, 250, 252, 0.65);
  backdrop-filter: blur(18px);
  display: grid;
  place-items: stretch end;
  z-index: 50;
}

.drawer {
  width: min(860px, 96vw);
  height: 100%;
  background: #f9fafb;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: -18px 0 70px rgba(15, 23, 42, 0.18);
  padding: 14px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 12px;
  min-height: 0;
  --tbl-font: clamp(11px, 1.25vh, 13px);
  --tbl-pad-y: clamp(7px, 0.95vh, 10px);
  --tbl-pad-x: clamp(8px, 1vw, 12px);
  --btn-h: clamp(30px, 3.3vh, 36px);
}

.drawerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.drawerTitle {
  font-weight: 860;
  letter-spacing: 0.2px;
}
.iconBtn {
  height: 34px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: #ffffff;
  color: #111827;
  cursor: pointer;
}
.drawerTools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.searchWrapper {
  position: relative;
  flex: 1 1 240px;
  min-width: 180px;
}
.searchIcon {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
}
.drawerInput {
  flex: 1;
  height: var(--btn-h);
  padding: 0 10px 0 24px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
  color: #111827;
  outline: none;
}
.drawerInput:focus {
  border-color: #0a84ff;
  box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.25);
}
.typeSelect {
  height: var(--btn-h);
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
  color: #111827;
  font-size: var(--tbl-font);
  flex: 0 0 140px;
}
.ghostBtn {
  height: var(--btn-h);
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  font-size: var(--tbl-font);
  flex: 0 0 auto;
}
.ghostBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.miniTable {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.miniTable th,
.miniTable td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.miniTable th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}
.miniTable td.mono {
  font-family: "Courier New", monospace;
  font-weight: 500;
}
.miniTable .pos {
  color: #059669;
}
.miniTable .neg {
  color: #dc2626;
}

.table {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(circle at top, #ffffff, #f8fafc);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.tbody {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
}
.tbody::-webkit-scrollbar {
  width: 6px;
}
.tbody::-webkit-scrollbar-track {
  background: transparent;
}
.tbody::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
}
.thead,
.trow {
  display: grid;
  grid-template-columns: minmax(150px, 1.2fr) minmax(120px, 0.7fr) minmax(
      320px,
      1.5fr
    );
  gap: 10px;
  padding: var(--tbl-pad-y) var(--tbl-pad-x);
  align-items: center;
  font-size: var(--tbl-font);
}
.thead > *,
.trow > * {
  min-width: 0;
}
.thead > :nth-child(1),
.thead > :nth-child(2),
.trow > :nth-child(1),
.trow > :nth-child(2) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.thead > :nth-child(3),
.trow > :nth-child(3) {
  overflow: visible;
  white-space: normal;
}
.thead {
  background: linear-gradient(90deg, #f1f5f9, #eef2ff);
  color: #1f2933;
  font-weight: 720;
  border-bottom: 1px solid rgba(229, 231, 235, 0.9);
}
.trow {
  border-top: 1px solid rgba(229, 231, 235, 0.85);
  transition:
    background-color 0.15s ease,
    transform 0.12s ease;
}
.trow:nth-child(odd) {
  background-color: rgba(249, 250, 251, 0.85);
}
.trow:hover {
  background-color: #eef2ff;
  transform: translateY(-1px);
}
.carCell {
  min-width: 0;
}
.carName {
  font-weight: 760;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.carMeta {
  font-size: 12px;
  margin-top: 2px;
}
.assignCell {
  display: grid;
  grid-template-columns: minmax(120px, 170px) auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
.assignBtns {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  min-width: 0;
}

@media (max-width: 720px) {
  .drawer {
    width: min(720px, 100vw);
    padding: 12px;
  }
  .drawerTools {
    gap: 8px;
  }
  .searchWrapper {
    flex: 1 1 100%;
    min-width: 0;
  }
  .typeSelect {
    flex: 1 1 160px;
    min-width: 140px;
  }
  .ghostBtn {
    flex: 1 1 160px;
  }

  .thead {
    display: none;
  }
  .trow {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 12px;
  }
  .trow > * {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 10px;
    align-items: start;
  }
  .trow > *::before {
    content: attr(data-label);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #64748b;
    padding-top: 2px;
    white-space: nowrap;
  }
  .assignCell {
    grid-template-columns: 1fr;
  }
  .assignCell::before {
    display: none;
  }
  .assignBtns {
    justify-content: flex-start;
  }
}
@media (max-width: 980px) {
  .assignCell {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .assignBtns {
    justify-content: flex-start;
  }
}
.select {
  height: calc(var(--btn-h) - 2px);
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: #ffffff;
  color: #111827;
  outline: none;
  font-size: var(--tbl-font);
  width: 100%;
  max-width: 200px;
  min-width: 0;
}
.smallBtn {
  height: calc(var(--btn-h) - 2px);
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: linear-gradient(135deg, #0a84ff, #4ba3ff);
  color: #ffffff;
  font-weight: 760;
  white-space: nowrap;
  cursor: pointer;
  font-size: var(--tbl-font);
  min-width: 66px;
}
.smallBtn.smallBtn--danger {
  border-color: rgba(220, 38, 38, 0.45);
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}
.smallBtn.smallBtn--danger:hover:not(:disabled) {
  filter: brightness(1.02) saturate(1.05);
}
.smallBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: saturate(0.8);
}
.drawerFoot {
  padding: 0 4px;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e5f2ff;
  color: #1d4ed8;
  font-size: 12px;
}
.pill--empty {
  background: #f3f4f6;
  color: #6b7280;
}

.emptyState {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}
.emptyTitle {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}
.emptyDesc {
  font-size: 12px;
}

.muted {
  color: #6b7280;
}
.mono {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

@media (max-width: 860px) {
  .grid12 {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
