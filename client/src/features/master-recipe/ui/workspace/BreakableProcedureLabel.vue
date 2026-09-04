<script>
import { h } from "vue";

function createBreakableLabelChildren(value) {
    const children = [];
    let segmentStart = 0;
    let segmentIndex = 0;

    for (let index = 0; index < value.length; index += 1) {
        if (value[index] !== ':') {
            continue;
        }

        children.push(
            h(
                'span',
                {
                    class: 'procedure-label__segment',
                    key: `segment-${segmentIndex}`,
                },
                value.slice(segmentStart, index + 1)
            )
        );
        children.push(h('wbr', { key: `break-${segmentIndex}` }));
        segmentStart = index + 1;
        segmentIndex += 1;
    }

    if (segmentStart < value.length) {
        children.push(
            h(
                'span',
                {
                    class: 'procedure-label__segment',
                    key: `segment-${segmentIndex}`,
                },
                value.slice(segmentStart)
            )
        );
    }

    return children;
}

export default {
    name: 'BreakableProcedureLabel',
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        return () => {
            const value = String(props.value ?? '');
            return h(
                'span',
                { class: 'procedure-label' },
                createBreakableLabelChildren(value)
            );
        };
    },
};
</script>

<style scoped>
.procedure-label {
    display: block;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 0 16px;
    white-space: normal;
    line-height: 1.25;
}

.procedure-label__segment {
    overflow-wrap: anywhere;
    word-break: normal;
    hyphens: none;
}
</style>
