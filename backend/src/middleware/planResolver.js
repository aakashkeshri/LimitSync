
function createPlanResolver(plans){
    if(!plans){
        throw new Error('Plans are required');
    }

    return function planResolver(req, res, next){
        const planName = req.user?.plan ?? "free";
        req.planName = planName;
        req.plan = plans[planName] ?? plans["free"];

        return next();
    };
}

export default createPlanResolver;