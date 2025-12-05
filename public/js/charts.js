// 数据可视化图表组件

// 图表配置和工具类
const ChartUtils = {
    // 颜色配置
    colors: {
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399',
        gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    },
    
    // 获取渐变色
    getGradientColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(this.colors.gradient[i % this.colors.gradient.length]);
        }
        return colors;
    },
    
    // 格式化数字
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + '千';
        }
        return num.toString();
    },
    
    // 格式化百分比
    formatPercent(num) {
        return (num * 100).toFixed(1) + '%';
    }
};

// 选课统计图表
const SelectionCharts = {
    // 选课趋势图
    renderTrendChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '选课人数',
                    data: data.values,
                    borderColor: ChartUtils.colors.primary,
                    backgroundColor: ChartUtils.colors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: ChartUtils.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '选课趋势统计',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return ChartUtils.formatNumber(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        return chart;
    },
    
    // 课程热度饼图
    renderCoursePopularityChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: ChartUtils.getGradientColors(data.labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '课程热度分布',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        return chart;
    },
    
    // 选课成功率柱状图
    renderSuccessRateChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '成功率',
                    data: data.values,
                    backgroundColor: data.values.map(value => 
                        value >= 0.8 ? ChartUtils.colors.success :
                        value >= 0.6 ? ChartUtils.colors.warning : ChartUtils.colors.danger
                    ),
                    borderColor: data.values.map(value => 
                        value >= 0.8 ? ChartUtils.colors.success :
                        value >= 0.6 ? ChartUtils.colors.warning : ChartUtils.colors.danger
                    ),
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '选课成功率统计',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return ChartUtils.formatPercent(value);
                            }
                        }
                    }
                }
            }
        });
        
        return chart;
    }
};

// 系统监控图表
const SystemCharts = {
    // 系统负载监控图
    renderSystemLoadChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'CPU使用率',
                    data: data.cpu,
                    borderColor: ChartUtils.colors.danger,
                    backgroundColor: ChartUtils.colors.danger + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: '内存使用率',
                    data: data.memory,
                    borderColor: ChartUtils.colors.warning,
                    backgroundColor: ChartUtils.colors.warning + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: '并发用户数',
                    data: data.users,
                    borderColor: ChartUtils.colors.primary,
                    backgroundColor: ChartUtils.colors.primary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '系统负载监控',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        return chart;
    },
    
    // 实时活动仪表盘
    renderActivityGauge(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['成功', '失败', '等待中'],
                datasets: [{
                    data: [data.success, data.failed, data.waiting],
                    backgroundColor: [
                        ChartUtils.colors.success,
                        ChartUtils.colors.danger,
                        ChartUtils.colors.warning
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '实时选课活动',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });
        
        return chart;
    }
};

// 教师端图表
const TeacherCharts = {
    // 学生成绩分布图
    renderGradeDistributionChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['优秀(90+)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)'],
                datasets: [{
                    label: '学生人数',
                    data: data.values,
                    backgroundColor: [
                        ChartUtils.colors.success,
                        ChartUtils.colors.primary,
                        ChartUtils.colors.info,
                        ChartUtils.colors.warning,
                        ChartUtils.colors.danger
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '学生成绩分布',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
        return chart;
    },
    
    // 课程选课情况图
    renderCourseSelectionChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;
        
        const chart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '已选人数',
                    data: data.selected,
                    backgroundColor: ChartUtils.colors.primary,
                    borderWidth: 1
                }, {
                    label: '候补人数',
                    data: data.waiting,
                    backgroundColor: ChartUtils.colors.warning,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '课程选课情况',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
        
        return chart;
    }
};

// 图表容器管理
const ChartManager = {
    charts: {},
    
    // 创建图表容器
    createChartContainer(id, title, height = '300px') {
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.style.height = height;
        container.innerHTML = `
            <div class="chart-header">
                <h4>${title}</h4>
                <div class="chart-actions">
                    <el-button size="mini" @click="refreshChart('${id}')">刷新</el-button>
                    <el-button size="mini" @click="exportChart('${id}')">导出</el-button>
                </div>
            </div>
            <div class="chart-content">
                <canvas id="${id}"></canvas>
            </div>
        `;
        return container;
    },
    
    // 渲染图表
    renderChart(containerId, chartType, data, options = {}) {
        const chart = this.charts[containerId];
        if (chart) {
            chart.destroy();
        }
        
        let newChart;
        switch (chartType) {
            case 'trend':
                newChart = SelectionCharts.renderTrendChart(containerId, data);
                break;
            case 'popularity':
                newChart = SelectionCharts.renderCoursePopularityChart(containerId, data);
                break;
            case 'successRate':
                newChart = SelectionCharts.renderSuccessRateChart(containerId, data);
                break;
            case 'systemLoad':
                newChart = SystemCharts.renderSystemLoadChart(containerId, data);
                break;
            case 'activity':
                newChart = SystemCharts.renderActivityGauge(containerId, data);
                break;
            case 'gradeDistribution':
                newChart = TeacherCharts.renderGradeDistributionChart(containerId, data);
                break;
            case 'courseSelection':
                newChart = TeacherCharts.renderCourseSelectionChart(containerId, data);
                break;
        }
        
        if (newChart) {
            this.charts[containerId] = newChart;
        }
        
        return newChart;
    },
    
    // 刷新图表
    refreshChart(containerId) {
        // 这里可以重新获取数据并更新图表
        console.log('刷新图表:', containerId);
    },
    
    // 导出图表
    exportChart(containerId) {
        const chart = this.charts[containerId];
        if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement('a');
            link.download = `chart-${containerId}-${Date.now()}.png`;
            link.href = url;
            link.click();
        }
    },
    
    // 销毁所有图表
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};

// 数据获取和格式化
const ChartDataProvider = {
    // 获取选课趋势数据
    async getSelectionTrendData(timeRange = '7d') {
        try {
            const response = await axios.get('/api/statistics/selection-trend', {
                params: { timeRange }
            });
            return response.data.data;
        } catch (error) {
            console.error('获取选课趋势数据失败:', error);
            return { labels: [], values: [] };
        }
    },
    
    // 获取课程热度数据
    async getCoursePopularityData() {
        try {
            const response = await axios.get('/api/statistics/course-popularity');
            return response.data.data;
        } catch (error) {
            console.error('获取课程热度数据失败:', error);
            return { labels: [], values: [] };
        }
    },
    
    // 获取选课成功率数据
    async getSuccessRateData() {
        try {
            const response = await axios.get('/api/statistics/success-rate');
            return response.data.data;
        } catch (error) {
            console.error('获取选课成功率数据失败:', error);
            return { labels: [], values: [] };
        }
    },
    
    // 获取系统负载数据
    async getSystemLoadData() {
        try {
            const response = await axios.get('/api/monitoring/system-load');
            return response.data.data;
        } catch (error) {
            console.error('获取系统负载数据失败:', error);
            return { labels: [], cpu: [], memory: [], users: [] };
        }
    },
    
    // 获取实时活动数据
    async getRealtimeActivityData() {
        try {
            const response = await axios.get('/api/monitoring/realtime-activity');
            return response.data.data;
        } catch (error) {
            console.error('获取实时活动数据失败:', error);
            return { success: 0, failed: 0, waiting: 0 };
        }
    }
};

// 导出图表工具
window.ChartUtils = ChartUtils;
window.SelectionCharts = SelectionCharts;
window.SystemCharts = SystemCharts;
window.TeacherCharts = TeacherCharts;
window.ChartManager = ChartManager;
window.ChartDataProvider = ChartDataProvider;
