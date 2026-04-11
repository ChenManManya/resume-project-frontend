<script lang="ts">
</script>

<template>
    <div class="templates-page">
        <AppTopNav />
        <main class="main">
            <div class="templates-filter-panel">
                <n-card title="筛选" style="margin-bottom: 16px">
                    <n-tabs type="line" animated>
                    <n-tab-pane name="oasis" tab="Oasis">
                        Wonderwall
                    </n-tab-pane>
                    <n-tab-pane name="the beatles" tab="the Beatles">
                        Hey Jude
                    </n-tab-pane>
                    <n-tab-pane name="jay chou" tab="周杰伦">
                        七里香
                    </n-tab-pane>
                    </n-tabs>
                </n-card>
            </div>
            <div class="content">
                <ResumeCardNew />
            </div>
        </main>
    </div>
</template>
<style lang="scss" scoped>
.templates-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}


.main {
    max-width: 1280px;
    margin: 0 auto;
    padding: $spacing-10 $spacing-6 $spacing-16;

    .templates-filter-panel {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .content {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }
}
</style>